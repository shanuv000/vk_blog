const https = require('https');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const vars = {};
    envLocal.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    });
    return vars;
}

const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

function fetchGraphQL(query) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query });
        const dataBuffer = Buffer.from(dataString);
        const url = new URL(ENDPOINT);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataBuffer.length,
                'Authorization': `Bearer ${TOKEN}`
            }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.write(dataBuffer);
        req.end();
    });
}

async function main() {
    console.log('=== CATEGORIES AUDIT ===\n');

    // Fetch all categories with post counts
    const catQuery = `
        query {
            categories {
                id
                name
                slug
                posts {
                    id
                    title
                }
            }
        }
    `;

    const catData = await fetchGraphQL(catQuery);

    if (catData.data && catData.data.categories) {
        console.log(`Total Categories: ${catData.data.categories.length}\n`);

        catData.data.categories
            .sort((a, b) => b.posts.length - a.posts.length)
            .forEach(cat => {
                console.log(`📁 ${cat.name} (${cat.posts.length} posts)`);
                console.log(`   Slug: ${cat.slug}`);
                if (cat.posts.length <= 3) {
                    console.log(`   ⚠️  Low usage - consider merging`);
                }
                console.log('');
            });
    }

    console.log('\n=== TAGS AUDIT ===\n');

    // Fetch all tags with post counts
    const tagQuery = `
        query {
            tags {
                id
                name
                slug
                posts {
                    id
                    title
                }
            }
        }
    `;

    const tagData = await fetchGraphQL(tagQuery);

    if (tagData.data && tagData.data.tags) {
        console.log(`Total Tags: ${tagData.data.tags.length}\n`);

        const tagsWithCounts = tagData.data.tags
            .map(tag => ({ ...tag, count: tag.posts.length }))
            .sort((a, b) => b.count - a.count);

        console.log('Most Used Tags:');
        tagsWithCounts.slice(0, 15).forEach(tag => {
            console.log(`  🏷️  ${tag.name} (${tag.count} posts)`);
        });

        console.log('\n\nTags Used Only Once (candidates for removal):');
        const singleUseTags = tagsWithCounts.filter(t => t.count === 1);
        console.log(`  Found ${singleUseTags.length} tags used only once\n`);

        singleUseTags.slice(0, 20).forEach(tag => {
            console.log(`  • ${tag.name} - on post: "${tag.posts[0].title.slice(0, 50)}..."`);
        });

        if (singleUseTags.length > 20) {
            console.log(`  ... and ${singleUseTags.length - 20} more`);
        }
    }

    // Show posts with too many tags
    console.log('\n\n=== POSTS WITH TOO MANY TAGS ===\n');

    const postsQuery = `
        query {
            posts(first: 100) {
                title
                slug
                categories {
                    name
                }
                tags {
                    name
                }
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);

    if (postsData.data && postsData.data.posts) {
        const overTagged = postsData.data.posts.filter(p => p.tags.length > 5);

        console.log(`Posts with more than 5 tags: ${overTagged.length}\n`);

        overTagged.slice(0, 10).forEach(post => {
            console.log(`📄 ${post.title.slice(0, 50)}...`);
            console.log(`   Categories: ${post.categories.map(c => c.name).join(', ') || 'None'}`);
            console.log(`   Tags (${post.tags.length}): ${post.tags.map(t => t.name).join(', ')}`);
            console.log('');
        });
    }
}

main().catch(err => console.error('Error:', err.message));

