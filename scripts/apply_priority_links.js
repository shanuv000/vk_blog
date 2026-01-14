const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Configuration ---
const PRIORITY_SLUGS = [
    // Web Dev / Security
    'react2shell-cve-2025-55182-rce-analysis',
    'mongobleed-cve-2025-14847-mongodb-memory-leak-exposed-databases',
    'getting-started-react-nextjs',
    // Gaming
    'bgmi-1-9-holi-update-free-rewards-download-links-storage',
    'apex-legends-players-disappointed-by-one-odd-feature-about-new-legends-design'
];

// --- Env Setup ---
function getEnvVars() {
    try {
        const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const parseEnv = (content) => {
            const vars = {};
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
            });
            return vars;
        };
        return parseEnv(envLocal);
    } catch (e) { return {}; }
}
const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

// --- Network ---
function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query, variables });
        const dataBuffer = Buffer.from(dataString);
        const url = new URL(ENDPOINT);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataBuffer.length,
                'Authorization': `Bearer ${TOKEN}`
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', c => body += c);
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

// --- Logic ---

function sanitizeNode(node) {
    const newNode = {};

    // 1. Text Nodes
    if (node.text !== undefined) {
        newNode.text = node.text || ''; // Ensure check
        if (node.bold) newNode.bold = true;
        if (node.italic) newNode.italic = true;
        if (node.underline) newNode.underline = true;
        if (node.code) newNode.code = true;
        return newNode;
    }

    // 2. Element Nodes
    if (node.type) {
        newNode.type = node.type;
        // Allowed props for common elements
        if (node.src) newNode.src = node.src;
        if (node.height) newNode.height = node.height;
        if (node.width) newNode.width = node.width;
        if (node.title) newNode.title = node.title;
        if (node.mime) newNode.mime = node.mime;
        if (node.handle) newNode.handle = node.handle;

        // Link specific
        if (node.type === 'link') {
            newNode.href = node.href;
            newNode.openInNewTab = !!node.openInNewTab;
            // Hygraph AST sometimes output 'title' for link tooltip, sometimes not. Safe to keep if present? 
            // Previous error suggested maybe stripping extra stuff. Let's keep it minimal.
        }
    } else {
        // Fallback for root or unknown?
        if (node.children) {
            // It's likely a container/root, but if it has no type, it might be the root object itself 
            // but this function is usually called on children.
            // If we are sanitizing the ROOT object { children: [...] }, we handle that outside or pass through.
        }
    }

    // 3. Children recursion
    if (node.children && Array.isArray(node.children)) {
        newNode.children = node.children.map(sanitizeNode);
    } else if (!newNode.text) {
        // Elements MUST have children. If empty, give it empty text?
        // Actually some void elements (image) might not need children? 
        // Hygraph images usually are 'image' type.
        if (newNode.type === 'image' || newNode.type === 'video') {
            // voids are ok
        } else {
            // Ensure children array exists for non-voids like paragraph, link, heating
            newNode.children = [{ text: '' }];
        }
    }

    return newNode;
}

function createParagraphWithLink(sentence, anchorText, linkUrl) {
    const parts = sentence.split(`[${anchorText}]`);
    const children = [];

    // Part 1
    if (parts[0] && parts[0].length > 0) {
        children.push({ text: parts[0] });
    }

    // Link
    const absoluteUrl = linkUrl.startsWith('http') ? linkUrl : `https://blog.urtechy.com${linkUrl}`;
    children.push({
        type: 'link',
        href: absoluteUrl,
        openInNewTab: false,
        children: [{ text: anchorText }] // No bold for AST safety first
    });

    // Part 2
    if (parts[1] && parts[1].length > 0) {
        children.push({ text: parts[1] });
    }

    return {
        type: 'paragraph',
        children
    };
}

function findInsertionIndex(contentJson, placementKeyword) {
    if (!contentJson || !contentJson.children) return -1;
    const lowerKeyword = placementKeyword.toLowerCase();
    for (let i = 0; i < contentJson.children.length; i++) {
        const node = contentJson.children[i];
        if (node.type && node.type.startsWith('heading')) {
            const text = extractText(node).toLowerCase();
            if (text.includes(lowerKeyword)) return i + 1;
        }
    }
    if (lowerKeyword.includes('intro')) return 1;
    return contentJson.children.length; // End
}

function extractText(node) {
    if (node.text) return node.text;
    if (node.children) return node.children.map(extractText).join(' ');
    return '';
}

async function main() {
    const linksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'links_to_apply.json'), 'utf8'));
    // Filter for priority
    const priorityLinks = linksData.filter(item => PRIORITY_SLUGS.includes(item.slug));

    console.log(`Starting update for ${priorityLinks.length} priority posts...`);

    for (const item of priorityLinks) {
        console.log(`\nProcessing: ${item.slug}`);

        // 1. Fetch
        const query = `query GetPost($slug: String!) { post(where: { slug: $slug }) { id content { json } } }`;
        const result = await fetchGraphQL(query, { slug: item.slug });
        const post = result.data?.post;

        if (!post) { console.error('  Not found.'); continue; }

        const originalContent = post.content.json;
        let modified = false;

        // 2. Modify
        for (const insert of item.inserts) {
            if (JSON.stringify(originalContent).includes(insert.anchorText)) {
                console.log(`  - Exists: [${insert.anchorText}]`);
                continue;
            }

            const newPara = createParagraphWithLink(insert.sentence, insert.anchorText, insert.linkUrl);
            let index = findInsertionIndex(originalContent, insert.placement);
            if (index > originalContent.children.length) index = originalContent.children.length;

            originalContent.children.splice(index, 0, newPara);
            console.log(`  - Queueing insert: [${insert.anchorText}]`);
            modified = true;
        }

        if (modified) {
            // 3. Sanitize
            const sanitizedContent = {
                children: originalContent.children.map(sanitizeNode)
            };

            // 4. Update
            const mutation = `
        mutation UpdatePost($id: ID!, $content: RichTextAST!) {
          updatePost(
            where: { id: $id }
            data: { content: { json: $content } }
          ) { id }
        }
      `;

            try {
                const updateResult = await fetchGraphQL(mutation, { id: post.id, content: sanitizedContent });
                if (updateResult.errors) {
                    console.error('  ! Update FAILED:', JSON.stringify(updateResult.errors[0].message));
                } else {
                    console.log('  * Update SUCCESS');
                    // Publish
                    const pubMutation = `mutation Publish($id: ID!) { publishPost(where: { id: $id }, to: PUBLISHED) { id } }`;
                    await fetchGraphQL(pubMutation, { id: post.id });
                    console.log('  * Published');
                }
            } catch (err) {
                console.error('  ! Network/Script Error:', err.message);
            }
        } else {
            console.log('  No changes needed.');
        }
    }
}

main();
