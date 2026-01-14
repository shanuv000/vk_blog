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
    console.log('=== FINDING TRULY UNCATEGORIZED POSTS ===\n');

    // Get ALL posts
    const query = `
        query {
            posts(first: 300) {
                id
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

    const data = await fetchGraphQL(query);
    const allPosts = data.data.posts;

    // Filter to those with no categories
    const uncategorized = allPosts.filter(p => !p.categories || p.categories.length === 0);

    console.log(`Total posts: ${allPosts.length}`);
    console.log(`Uncategorized: ${uncategorized.length}\n`);

    if (uncategorized.length === 0) {
        console.log('✅ All posts are categorized!');
        return;
    }

    console.log('Posts without categories:\n');

    uncategorized.forEach((post, i) => {
        console.log(`${i + 1}. "${post.title}"`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   Tags: ${post.tags.map(t => t.name).join(', ') || 'None'}`);
        console.log('');
    });
}

main().catch(err => console.error('Error:', err.message));
