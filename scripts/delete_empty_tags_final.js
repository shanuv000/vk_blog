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
    console.log('=== DELETING EMPTY & LOW-VALUE TAGS ===\n');

    // Get all tags with post counts
    const tagQuery = `
        query {
            tags {
                id
                name
                posts {
                    id
                }
            }
        }
    `;

    const tagData = await fetchGraphQL(tagQuery);
    const tags = tagData.data.tags;

    // Tags to delete: 0-2 posts OR specific low-value tags
    const tagsToDelete = tags.filter(tag => {
        const count = tag.posts.length;
        const lowValueNames = ['Opinion & Analysis', 'Web3 & Blockchain', 'Game Reviews'];

        return count === 0 || count <= 2 || lowValueNames.includes(tag.name);
    });

    console.log(`Found ${tagsToDelete.length} tags to delete:\n`);

    let deleted = 0;
    let errors = 0;

    for (const tag of tagsToDelete) {
        const count = tag.posts.length;

        // Delete tag
        const deleteMutation = `
            mutation DeleteTag($id: ID!) {
                deleteTag(where: { id: $id }) {
                    id
                }
            }
        `;

        const result = await fetchGraphQL(deleteMutation, { id: tag.id });

        if (result.errors) {
            console.error(`❌ Failed: ${tag.name} (${count} posts) - ${result.errors[0].message}`);
            errors++;
        } else {
            console.log(`✅ Deleted: ${tag.name.padEnd(35)} (${count} posts)`);
            deleted++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Tags deleted:    ${deleted}`);
    console.log(`❌ Errors:         ${errors}`);
    console.log('='.repeat(70));
    console.log('\n📋 Run audit to see final clean tag list');
}

main().catch(err => console.error('Error:', err.message));
