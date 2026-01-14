const fs = require('fs');
const path = require('path');
const https = require('https');

// Env setup (simplified)
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

// Fetch
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

async function findLink() {
    const query = `
    query {
      posts(first: 5) {
        slug
        content { json }
      }
    }
  `;
    const result = await fetchGraphQL(query);

    if (!result.data) {
        console.log(result);
        return;
    }

    for (const post of result.data.posts) {
        const content = post.content.json;
        if (!content.children) continue;

        function traverse(node) {
            if (node.type === 'link') {
                console.log('FOUND LINK NODE:');
                console.log(JSON.stringify(node, null, 2));
                process.exit(0);
            }
            if (node.children) node.children.forEach(traverse);
        }

        traverse(content);
    }
    console.log('No links found in first 5 posts.');
}

findLink();
