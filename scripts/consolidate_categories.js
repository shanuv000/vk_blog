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

// Map old categories to new consolidated ones
const CATEGORY_CONSOLIDATION = {
    // Technology group
    'Tech': 'Technology',
    'Tech & AI': 'Technology',

    // Gaming group
    'Gaming': 'Gaming & Esports',
    'Esports': 'Gaming & Esports',
    'Games': 'Gaming & Esports',

    // Entertainment group
    'Movies': 'Entertainment',
    'TV Shows': 'Entertainment',
    'Movies & TV': 'Entertainment',
    'Marvel': 'Entertainment',
    'DC': 'Entertainment',
    'Superheroes': 'Entertainment',
    'Celebrity News': 'Entertainment',
    'Music': 'Entertainment',

    // Sports group
    'Cricket': 'Sports',
    'IPL': 'Sports',

    // Business group
    'Business': 'Finance & Business',
    'Finance': 'Finance & Business',

    // Lifestyle group
    'LifeStyle': 'Lifestyle',

    // Keep as-is (already good)
    'Web Development & Security': 'Web Development & Security',
    'Education': 'Education',
    'Science': 'Science',
    'News': 'News'
};

async function main() {
    console.log('=== CATEGORY CONSOLIDATION ===\n');

    // 1. Get all categories
    const catQuery = `query { categories { id name slug } }`;
    const catData = await fetchGraphQL(catQuery);
    const categories = catData.data.categories;

    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    console.log(`Found ${categories.length} total categories\n`);

    // 2. Get all posts
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

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const post of posts) {
        if (!post.categories || post.categories.length === 0) {
            console.log(`⏭️  No category: "${post.title.slice(0, 40)}..."`);
            skipped++;
            continue;
        }

        const currentCategory = post.categories[0];
        const targetCategoryName = CATEGORY_CONSOLIDATION[currentCategory.name];

        // Already in correct category or no mapping exists
        if (!targetCategoryName || targetCategoryName === currentCategory.name) {
            continue;
        }

        const targetCategoryId = categoryMap[targetCategoryName];

        if (!targetCategoryId) {
            console.error(`❌ Target category "${targetCategoryName}" not found`);
            continue;
        }

        // Update post - disconnect old, connect new
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

        const updateResult = await fetchGraphQL(updateMutation, {
            postId: post.id,
            oldCatId: currentCategory.id,
            newCatId: targetCategoryId
        });

        if (updateResult.errors) {
            console.error(`❌ "${post.title.slice(0, 30)}...":`, updateResult.errors[0].message);
            errors++;
        } else {
            // Publish
            await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });

            console.log(`✅ "${post.title.slice(0, 35)}..." → ${currentCategory.name} ➜ ${targetCategoryName}`);
            updated++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('CONSOLIDATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully moved:  ${updated}`);
    console.log(`⏭️  Skipped:            ${skipped}`);
    console.log(`❌ Errors:             ${errors}`);
    console.log('='.repeat(70));

    console.log('\n📋 RECOMMENDED FINAL CATEGORIES (Keep these):');
    const finalCategories = [
        'Technology',
        'Gaming & Esports',
        'Web Development & Security',
        'Entertainment',
        'Sports',
        'Finance & Business',
        'Lifestyle',
        'Education',
        'Science',
        'News'
    ];

    finalCategories.forEach(cat => {
        const count = posts.filter(p => p.categories[0]?.name === cat).length;
        console.log(`  ✓ ${cat.padEnd(30)} (${count} posts after consolidation)`);
    });

    console.log('\n🗑️  DELETE THESE OLD CATEGORIES (now empty):');
    const deleteCategories = Object.keys(CATEGORY_CONSOLIDATION).filter(old => old !== CATEGORY_CONSOLIDATION[old]);
    deleteCategories.forEach(cat => console.log(`  - ${cat}`));
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
});
