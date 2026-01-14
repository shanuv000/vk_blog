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
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

async function main() {
    console.log('=== TAG ACCURACY VERIFICATION ===\n');

    // Get all posts with titles, categories, and tags
    const postsQuery = `
        query {
            posts(first: 300) {
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
    const posts = postsData.data.posts;

    console.log(`Checking ${posts.length} posts for tag accuracy...\n`);

    // Sample random posts from each category
    const categories = ['Entertainment', 'Technology', 'Sports', 'Gaming & Esports', 'News'];

    for (const category of categories) {
        const categoryPosts = posts.filter(p => p.categories[0]?.name === category);

        if (categoryPosts.length === 0) continue;

        console.log(`\n${'='.repeat(70)}`);
        console.log(`📁 ${category.toUpperCase()} (${categoryPosts.length} posts)`);
        console.log('='.repeat(70));

        // Show first 5 posts as samples
        const samples = categoryPosts.slice(0, 5);

        samples.forEach((post, i) => {
            console.log(`\n${i + 1}. "${post.title.slice(0, 60)}..."`);
            console.log(`   Tags: ${post.tags.map(t => t.name).join(', ') || 'NO TAGS'}`);

            // Basic relevance check
            const title = post.title.toLowerCase();
            const tags = post.tags.map(t => t.name.toLowerCase());

            // Check if tags seem relevant to title
            let relevant = 0;
            let questionable = 0;

            post.tags.forEach(tag => {
                const tagWords = tag.name.toLowerCase().split(/[& ]+/);
                const titleWords = title.split(/\s+/);

                const hasOverlap = tagWords.some(tw =>
                    titleWords.some(word => word.includes(tw) || tw.includes(word))
                );

                if (hasOverlap) {
                    relevant++;
                } else {
                    questionable++;
                }
            });

            if (questionable > 0 && post.tags.length > 0) {
                console.log(`   ⚠️  ${questionable} tag(s) might not match title content`);
            } else if (post.tags.length === 0) {
                console.log(`   ⚠️  NO TAGS - needs tagging`);
            } else if (relevant === post.tags.length) {
                console.log(`   ✅ All tags appear relevant`);
            }
        });
    }

    // Check posts with NO tags
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('⚠️  POSTS WITH NO TAGS');
    console.log('='.repeat(70));

    const noTags = posts.filter(p => p.tags.length === 0);
    console.log(`\nFound ${noTags.length} posts without any tags:\n`);

    noTags.slice(0, 20).forEach((post, i) => {
        console.log(`${i + 1}. [${post.categories[0]?.name || 'No Category'}] "${post.title.slice(0, 50)}..."`);
    });

    if (noTags.length > 20) {
        console.log(`... and ${noTags.length - 20} more`);
    }

    // Check posts with TOO MANY tags
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('📊 TAG DISTRIBUTION PER POST');
    console.log('='.repeat(70));

    const tagCounts = {};
    posts.forEach(post => {
        const count = post.tags.length;
        tagCounts[count] = (tagCounts[count] || 0) + 1;
    });

    console.log('\nPosts by number of tags:');
    Object.keys(tagCounts)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(count => {
            const bar = '█'.repeat(Math.ceil(tagCounts[count] / 5));
            console.log(`  ${String(count).padStart(2)} tags: ${String(tagCounts[count]).padStart(3)} posts ${bar}`);
        });

    const avgTags = posts.reduce((sum, p) => sum + p.tags.length, 0) / posts.length;
    console.log(`\n  Average: ${avgTags.toFixed(1)} tags per post`);
    console.log(`  Optimal: 3-5 tags per post (best practice)`);

    // Summary
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Total posts:           ${posts.length}`);
    console.log(`⚠️  Posts with 0 tags:     ${noTags.length} (${(noTags.length / posts.length * 100).toFixed(1)}%)`);
    console.log(`✅ Posts with 1-5 tags:   ${posts.filter(p => p.tags.length >= 1 && p.tags.length <= 5).length}`);
    console.log(`⚠️  Posts with 6+ tags:    ${posts.filter(p => p.tags.length > 5).length}`);
}

main().catch(err => console.error('Error:', err.message));
