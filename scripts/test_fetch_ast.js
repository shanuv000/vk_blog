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

console.log('Endpoint:', ENDPOINT);
console.log('Token exists:', !!TOKEN);

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
        req.write(dataBuffer);
        req.end();
    });
}

// First, let's just list posts to see what exists
const listQuery = `
  query {
    posts(first: 5, orderBy: createdAt_DESC) {
      id
      title
      slug
    }
  }
`;

fetchGraphQL(listQuery).then(data => {
    console.log('\n=== API Response ===');
    console.log(JSON.stringify(data, null, 2));

    if (data.errors) {
        console.error('\n❌ GraphQL Errors:', data.errors);
        return;
    }

    if (!data.data || !data.data.posts) {
        console.error('\n❌ No posts data returned');
        return;
    }

    console.log('\n=== Available Posts ===');
    data.data.posts.forEach(post => {
        console.log(`- ${post.slug}`);
    });

    // Now try to fetch the first post's full content
    if (data.data.posts.length > 0) {
        const firstSlug = data.data.posts[0].slug;
        console.log(`\n=== Fetching full content for: ${firstSlug} ===`);

        const detailQuery = `
          query {
            post(where: { slug: "${firstSlug}" }) {
              id
              title
              content {
                json
              }
            }
          }
        `;

        return fetchGraphQL(detailQuery);
    }
}).then(detailData => {
    if (!detailData) return;

    console.log('\n=== Full Content Response ===');

    if (detailData.errors) {
        console.error('Errors:', detailData.errors);
        return;
    }

    if (!detailData.data || !detailData.data.post) {
        console.error('No post data in detail response');
        return;
    }

    const post = detailData.data.post;
    console.log('\nPost Title:', post.title);
    console.log('\nContent AST:');
    console.log(JSON.stringify(post.content.json, null, 2));

    // Look for links
    const findLinks = (node, depth = 0) => {
        if (!node) return;

        if (node.type === 'link' || node.type === 'a') {
            console.log('\n✅ Found existing link node:');
            console.log(JSON.stringify(node, null, 2));
        }

        if (node.children) {
            node.children.forEach(child => findLinks(child, depth + 1));
        }
    };

    if (post.content.json.children) {
        post.content.json.children.forEach(node => findLinks(node));
    }
}).catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
});
