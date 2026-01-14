const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to read env variables manually
function getEnvVars() {
    try {
        const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const env = fs.existsSync(path.join(process.cwd(), '.env'))
            ? fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
            : '';

        const parseEnv = (content) => {
            const vars = {};
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    vars[key] = value;
                }
            });
            return vars;
        };
        return { ...parseEnv(env), ...parseEnv(envLocal) };
    } catch (e) {
        console.error('Error reading .env files:', e);
        return {};
    }
}

const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

if (!ENDPOINT || !TOKEN) {
    console.error('Missing Hygraph configuration');
    process.exit(1);
}

// Helper to send GraphQL request
function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query, variables });
        const dataBuffer = Buffer.from(dataString); // Convert to buffer to handle UTF-8 correctly

        const url = new URL(ENDPOINT);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataBuffer.length, // Correct byte usage
                'Authorization': `Bearer ${TOKEN}`
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(dataBuffer);
        req.end();
    });
}

// DEBUG: Temporary plain text to test mutation
function createParagraphWithLink(sentence, anchorText, linkUrl) {
    return {
        type: 'paragraph',
        children: [{ text: sentence.replace('[', '').replace(']', '') }]
    };
}

// Heuristic to find insertion point
function findInsertionIndex(contentJson, placementKeyword) {
    if (!contentJson || !contentJson.children) return -1;

    const lowerKeyword = placementKeyword.toLowerCase();

    for (let i = 0; i < contentJson.children.length; i++) {
        const node = contentJson.children[i];

        // Check if it's a heading
        if (node.type && node.type.startsWith('heading')) {
            const text = extractText(node).toLowerCase();
            if (text.includes(lowerKeyword)) {
                return i + 1; // Insert AFTER the heading
            }
        }
    }

    // Hardcoded fallbacks
    if (lowerKeyword.includes('intro')) return 1; // After title/first para
    if (lowerKeyword.includes('conclus')) return contentJson.children.length;

    return -1; // Not found
}

function extractText(node) {
    if (node.text) return node.text;
    if (node.children) return node.children.map(extractText).join(' ');
    return '';
}

async function main() {
    const linksToApply = JSON.parse(fs.readFileSync(path.join(__dirname, 'links_to_apply.json'), 'utf8'));

    for (const item of linksToApply) {
        console.log(`Processing ${item.slug}...`);

        // 1. Fetch
        const query = `
      query GetPost($slug: String!) {
        post(where: { slug: $slug }) {
          id
          content { 
            json 
          }
        }
      }
    `;

        const result = await fetchGraphQL(query, { slug: item.slug });
        const post = result.data?.post;

        if (!post) {
            console.error(`Post not found: ${item.slug}`);
            continue;
        }

        if (!post.content || !post.content.json) {
            console.error(`Post has no content: ${item.slug}`);
            continue;
        }

        let currentContent = post.content.json;
        let updatesCount = 0;

        // 2. Insert Paragraphs
        for (const insert of item.inserts) {
            if (JSON.stringify(currentContent).includes(insert.anchorText)) {
                console.log(`  - Skipping: Link/Anchor "${insert.anchorText}" already exists.`);
                continue;
            }

            const newPara = createParagraphWithLink(insert.sentence, insert.anchorText, insert.linkUrl);

            let index = findInsertionIndex(currentContent, insert.placement);

            // Fallback strategies
            if (index === -1) {
                if (insert.placement === 'Introduction') index = 1;
                else index = currentContent.children.length; // Append to end
            }

            // Ensure index is valid
            if (index > currentContent.children.length) index = currentContent.children.length;

            // Insert
            currentContent.children.splice(index, 0, newPara);
            console.log(`  - Inserted: "${insert.anchorText}" at index ${index} (Placement: ${insert.placement})`);
            updatesCount++;
        }

        if (updatesCount > 0) {
            // 3. Update
            const mutation = `
        mutation UpdatePost($id: ID!, $content: RichTextAST!) {
          updatePost(
            where: { id: $id }
            data: { content: { json: $content } }
          ) {
            id
            slug
          }
        }
      `;

            const updateResult = await fetchGraphQL(mutation, {
                id: post.id,
                content: currentContent
            });

            if (updateResult.errors) {
                console.error('  Mutation Error:', JSON.stringify(updateResult.errors));
            } else {
                console.log('  Success: Content updated.');

                // 4. Publish
                const publishMutation = `
          mutation PublishPost($id: ID!) {
            publishPost(where: { id: $id }, to: PUBLISHED) {
              id
            }
          }
        `;
                await fetchGraphQL(publishMutation, { id: post.id });
                console.log('  Success: Published.');
            }
        } else {
            console.log('  No changes needed.');
        }
    }
}

main();
