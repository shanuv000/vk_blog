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
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

// Final migration map for stragglers
const FINAL_MIGRATIONS = {
    'IPL': 'Sports',
    'Cricket': 'Sports',
    'Tech': 'Technology',
    'Superhero': 'Entertainment',
    'Esports': 'Gaming & Esports',
    'Finance': 'Finance & Business',
    'Movies & TV': 'Entertainment',
    'TV Shows': 'Entertainment'
};

async function main() {
    console.log('=== FINAL CATEGORY CLEANUP ===\n');

    // Get category ID map
    const catQuery = `query { categories { id name slug } }`;
    const catData = await fetchGraphQL(catQuery);
    const categories = catData.data.categories;

    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    // Get all posts
    const postsQuery = `
        query {
            posts(first: 300) {
                id
                title
                slug
                categories {
                    id
                    name
                }
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);
    const posts = postsData.data.posts;

    console.log(`Processing ${posts.length} posts...\n`);

    let moved = 0;
    let errors = 0;

    for (const post of posts) {
        if (!post.categories || post.categories.length === 0) continue;

        const currentCat = post.categories[0];
        const targetCatName = FINAL_MIGRATIONS[currentCat.name];

        if (!targetCatName) continue; // Already in final category

        const targetCatId = categoryMap[targetCatName];

        if (!targetCatId) {
            console.error(`❌ Target category "${targetCatName}" not found`);
            continue;
        }

        // Move post
        const updateMutation = `
            mutation UpdatePost($postId: ID!, $oldCatId: ID!, $newCatId: ID!) {
                updatePost(
                    where: { id: $postId }
                    data: {
                        categories: {
                            disconnect: [{ id: $oldCatId }]
                            connect: [{ where: { id: $newCatId } }]
                        }
                    }
                ) {
                    id
                }
            }
        `;

        const result = await fetchGraphQL(updateMutation, {
            postId: post.id,
            oldCatId: currentCat.id,
            newCatId: targetCatId
        });

        if (result.errors) {
            console.error(`❌ "${post.title.slice(0, 30)}...":`, result.errors[0].message);
            errors++;
        } else {
            await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });
            console.log(`✅ "${post.title.slice(0, 40)}..." → ${currentCat.name} ➜ ${targetCatName}`);
            moved++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Successfully moved: ${moved}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(70));

    console.log('\n📋 Run the count script again to verify:');
    console.log('   node scripts/count_by_category.js');
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
});
