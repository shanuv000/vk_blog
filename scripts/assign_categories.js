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

function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query, variables });
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
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

// Tag-to-Category mapping
const TAG_TO_CATEGORY = {
    'Sports Esports': 'Gaming & Esports',
    'Esports & Competitive Gaming': 'Gaming & Esports',
    'Gaming News': 'Gaming & Esports',

    'Software Development': 'Web Development & Security',

    'AI & Artificial Intelligence': 'Tech & AI',
    'Science & Innovation': 'Tech & AI',

    'MCU & Marvel': 'Entertainment',
    'DC Comics Universe': 'Entertainment',
    'TV Shows & Series': 'Entertainment',
    'Celebrity Lifestyle': 'Entertainment',

    'Cricket & IPL': 'Sports',
    'Football & Soccer': 'Sports',
    'Sports News': 'Sports'
};

async function main() {
    console.log('=== CATEGORY ASSIGNMENT STARTED ===\n');
    console.log('Fetching categories...');

    // 1. Get all categories
    const catQuery = `query { categories { id name slug } }`;
    const catData = await fetchGraphQL(catQuery);

    if (!catData.data || !catData.data.categories) {
        console.error('❌ Failed to fetch categories');
        return;
    }

    const categories = catData.data.categories;

    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    console.log('\nAvailable categories:');
    categories.forEach(cat => console.log(`  ✓ ${cat.name} (${cat.slug})`));

    // 2. Get all posts with tags
    console.log('\nFetching posts with tags...');

    const postsQuery = `
        query {
            posts(first: 300) {
                id
                title
                slug
                tags {
                    name
                }
                categories {
                    name
                }
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);

    if (!postsData.data || !postsData.data.posts) {
        console.error('❌ Failed to fetch posts');
        return;
    }

    const posts = postsData.data.posts;

    console.log(`\nProcessing ${posts.length} posts...\n`);

    let assigned = 0;
    let skipped = 0;
    let alreadyHas = 0;

    for (const post of posts) {
        // Skip if already has a category
        if (post.categories && post.categories.length > 0) {
            console.log(`⏭️  Already categorized: "${post.title.slice(0, 40)}..." → ${post.categories[0].name}`);
            alreadyHas++;
            continue;
        }

        // Determine category from tags
        let categoryId = null;
        let categoryName = null;

        for (const tag of post.tags) {
            if (TAG_TO_CATEGORY[tag.name]) {
                categoryName = TAG_TO_CATEGORY[tag.name];
                categoryId = categoryMap[categoryName];
                break;
            }
        }

        if (!categoryId) {
            const tagNames = post.tags.map(t => t.name).join(', ');
            console.log(`❓ No match: "${post.title.slice(0, 35)}..." - Tags: ${tagNames.slice(0, 50)}`);
            skipped++;
            continue;
        }

        // Update post with category
        const updateMutation = `
            mutation UpdatePost($id: ID!, $categoryId: ID!) {
                updatePost(
                    where: { id: $id }
                    data: { categories: { connect: { id: $categoryId } } }
                ) {
                    id
                }
            }
        `;

        const updateResult = await fetchGraphQL(updateMutation, {
            id: post.id,
            categoryId: categoryId
        });

        if (updateResult.errors) {
            console.error(`❌ Failed: "${post.title.slice(0, 40)}..."`, updateResult.errors[0].message);
        } else {
            // Publish
            await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });

            console.log(`✅ "${post.title.slice(0, 40)}..." → ${categoryName}`);
            assigned++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Newly assigned:      ${assigned}`);
    console.log(`⏭️  Already had category: ${alreadyHas}`);
    console.log(`❓ No matching tags:    ${skipped}`);
    console.log(`📊 Total processed:     ${posts.length}`);
    console.log('='.repeat(70));
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
    console.error(err.stack);
});
