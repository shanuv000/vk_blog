const fs = require('fs');
const path = require('path');
const https = require('https');

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

async function verifyAccess() {
    console.log("Verifying Hygraph Access...");
    const slugs = [
        'react2shell-cve-2025-55182-rce-analysis',
        'epstein-files-explained-documents-transparency',
        'ai-memory-demand-pc-upgrade-costs',
        'bgmi-1-9-holi-update-free-rewards-download-links-storage',
        'getting-started-react-nextjs'
    ];

    const query = `
    query GetPosts($slugs: [String!]) {
      posts(where: { slug_in: $slugs }) {
        title
        slug
        id
      }
    }
  `;

    try {
        const result = await fetchGraphQL(query, { slugs });
        if (result.errors) {
            console.error("Access Error:", result.errors);
        } else {
            console.log(`Successfully accessed ${result.data.posts.length} posts:`);
            result.data.posts.forEach(p => console.log(` - [${p.id}] ${p.title}`));
        }
    } catch (e) {
        console.error("Network Error:", e);
    }
}

verifyAccess();
