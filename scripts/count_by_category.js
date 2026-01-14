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
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.errors) {
                        console.error('GraphQL Errors:', JSON.stringify(parsed.errors, null, 2));
                    }
                    resolve(parsed);
                } catch (e) {
                    reject(new Error('Failed to parse response: ' + body.slice(0, 200)));
                }
            });
        });
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

async function main() {
    console.log('=== CATEGORY POST COUNTS ===\n');

    // First get all posts with their categories
    const postsQuery = `
        query {
            posts(first: 300) {
                id
                title
                categories {
                    name
                    slug
                }
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);

    if (!postsData.data || !postsData.data.posts) {
        console.error('Failed to fetch posts');
        console.log('Response:', JSON.stringify(postsData, null, 2));
        return;
    }

    const posts = postsData.data.posts;

    // Count posts per category
    const categoryCounts = {};
    let uncategorized = 0;

    posts.forEach(post => {
        if (!post.categories || post.categories.length === 0) {
            uncategorized++;
        } else {
            const catName = post.categories[0].name;
            categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
        }
    });

    // Sort by count
    const sorted = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    console.log('Current Category Distribution:\n');

    sorted.forEach(cat => {
        const bar = '█'.repeat(Math.ceil(cat.count / 5));
        console.log(`  ${cat.name.padEnd(30)} ${String(cat.count).padStart(3)} ${bar}`);
    });

    if (uncategorized > 0) {
        console.log(`\n  ⚠️  Uncategorized                ${String(uncategorized).padStart(3)}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Total posts: ${posts.length}`);
    console.log(`✅ Categorized: ${posts.length - uncategorized}`);
    console.log(`⚠️  Uncategorized: ${uncategorized}`);
    console.log('='.repeat(60));

    // Get all categories to show empty ones
    const catQuery = `query { categories { name slug } }`;
    const catData = await fetchGraphQL(catQuery);

    if (catData.data && catData.data.categories) {
        const allCategories = catData.data.categories;
        const emptyCategories = allCategories.filter(cat => !categoryCounts[cat.name]);

        if (emptyCategories.length > 0) {
            console.log('\n🗑️  EMPTY CATEGORIES (Delete these in Hygraph):');
            emptyCategories.forEach(cat => {
                console.log(`  - ${cat.name.padEnd(30)} (${cat.slug})`);
            });
        }
    }
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
    console.error(err.stack);
});
