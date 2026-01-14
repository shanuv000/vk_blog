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
        req.write(dataBuffer);
        req.end();
    });
}

const CATEGORIES = [
    { name: 'Gaming & Esports', slug: 'gaming-esports' },
    { name: 'Web Development & Security', slug: 'web-dev-security' },
    { name: 'Tech & AI', slug: 'tech-ai' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Finance & Business', slug: 'finance-business' }
];

async function main() {
    console.log('Creating Categories...\n');

    for (const cat of CATEGORIES) {
        const mutation = `
            mutation CreateCategory($name: String!, $slug: String!, $show: Boolean!) {
                createCategory(data: { 
                    name: $name, 
                    slug: $slug,
                    show: $show
                }) {
                    id
                    name
                    slug
                }
            }
        `;

        const result = await fetchGraphQL(mutation, {
            ...cat,
            show: true  // ✅ Added required field
        });

        if (result.errors) {
            console.error(`❌ Failed to create "${cat.name}":`, result.errors[0].message);
        } else {
            console.log(`✅ Created: ${cat.name} (${cat.slug})`);

            // Publish category
            const publishMutation = `
                mutation PublishCategory($id: ID!) {
                    publishCategory(where: { id: $id }, to: PUBLISHED) {
                        id
                    }
                }
            `;
            await fetchGraphQL(publishMutation, { id: result.data.createCategory.id });
            console.log(`   Published ✓`);
        }
    }

    console.log('\n✅ All categories created and published!');
}

main().catch(err => console.error('Error:', err.message));
