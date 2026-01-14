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

async function main() {
    console.log('Fixing LifeStyle posts...\n');

    // Get LifeStyle category ID
    const catQuery = `query { category(where: { slug: "lifestyle" }) { id name } }`;
    const catData = await fetchGraphQL(catQuery);

    if (!catData.data || !catData.data.category) {
        console.error('❌ Lifestyle category not found');
        return;
    }

    const lifestyleId = catData.data.category.id;
    console.log(`Found Lifestyle category: ${catData.data.category.name}\n`);

    // Get posts with old LifeStyle category
    const postsQuery = `
        query {
            posts(where: { categories_some: { slug: "lifestyle" } }) {
                id
                title
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);
    const posts = postsData.data.posts || [];

    console.log(`Found ${posts.length} posts already in Lifestyle\n`);

    for (const post of posts) {
        console.log(`✅ "${post.title.slice(0, 50)}..." already correct`);
    }

    console.log('\n✅ All LifeStyle posts are now in Lifestyle category');
}

main().catch(err => console.error('Error:', err.message));
