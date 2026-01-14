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
    console.log('=== UNCATEGORIZED POSTS ===\n');

    const query = `
        query {
            posts(where: { categories_every: {} }, first: 20) {
                title
                slug
                tags {
                    name
                }
            }
        }
    `;

    const data = await fetchGraphQL(query);
    const posts = data.data?.posts || [];

    console.log(`Found ${posts.length} uncategorized posts:\n`);

    posts.forEach((post, i) => {
        console.log(`${i + 1}. "${post.title}"`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   Tags: ${post.tags.map(t => t.name).join(', ')}`);
        console.log('');
    });
}

main().catch(err => console.error('Error:', err.message));
