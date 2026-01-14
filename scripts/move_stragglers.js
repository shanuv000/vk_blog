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
    console.log('Moving last 2 stragglers...\n');

    // Get category IDs
    const catQuery = `query { categories { id name } }`;
    const catData = await fetchGraphQL(catQuery);
    const categoryMap = {};
    catData.data.categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    const moves = [
        { from: 'Finance', to: 'Finance & Business' },
        { from: 'Marvel', to: 'Entertainment' }
    ];

    for (const move of moves) {
        // Find posts in old category
        const postsQuery = `
            query {
                posts(where: { categories_some: { name: "${move.from}" } }) {
                    id
                    title
                    categories {
                        id
                        name
                    }
                }
            }
        `;

        const postsData = await fetchGraphQL(postsQuery);
        const posts = postsData.data.posts || [];

        for (const post of posts) {
            const oldCat = post.categories.find(c => c.name === move.from);

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
                oldCatId: oldCat.id,
                newCatId: categoryMap[move.to]
            });

            if (result.errors) {
                console.error(`❌ Failed:`, result.errors[0].message);
            } else {
                await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });
                console.log(`✅ "${post.title.slice(0, 50)}..." → ${move.from} ➜ ${move.to}`);
            }
        }
    }

    console.log('\n✅ Done! Run count script to verify.');
}

main().catch(err => console.error('Error:', err.message));
