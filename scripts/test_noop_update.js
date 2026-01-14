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

async function test() {
    const slug = "react2shell-cve-2025-55182-rce-analysis";

    const query = `
    query GetPost($slug: String!) {
      post(where: { slug: $slug }) {
        id
        content { json }
      }
    }
  `;
    const result = await fetchGraphQL(query, { slug });
    const post = result.data.post;
    const content = post.content.json;

    // Hardcoded mutation to test AST structure directly
    const mutation = `
    mutation UpdatePost($id: ID!) {
      updatePost(
        where: { id: $id }
        data: { 
          content: { 
            json: { 
              children: [
                { type: "paragraph", children: [{ text: "Hardcoded test update." }] }
              ] 
            } 
          } 
        }
      ) { id }
    }
  `;

    console.log('Attempting HARDCODED update...');
    const updateResult = await fetchGraphQL(mutation, { id: post.id });

    if (updateResult.errors) {
        console.error('HARDCODED Update Failed:', JSON.stringify(updateResult.errors, null, 2));

        // Dump content to inspect
        fs.writeFileSync('failed_content_dump.json', JSON.stringify(content, null, 2));
    } else {
        console.log('NOOP Update Succeeded!');
    }
}

test();
