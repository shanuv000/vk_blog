const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to read env variables manually since we don't want to depend on dotenv package availability
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

if (!ENDPOINT) {
  console.error('Missing NEXT_PUBLIC_HYGRAPH_CONTENT_API');
  process.exit(1);
}

const query = `
  query GetAllPosts {
    posts(first: 100, stage: PUBLISHED, orderBy: publishedAt_DESC) {
      title
      slug
      excerpt
      publishedAt
      categories {
        name
        slug
      }
      content {
        text
        json
      }
    }
  }
`;

// Helper to send GraphQL request using native https module to avoid dependencies
function fetchGraphQL(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const url = new URL(ENDPOINT);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${body}`));
        } else {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('Fetching posts from Hygraph...');
    const result = await fetchGraphQL(query);
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      process.exit(1);
    }
    
    const posts = result.data.posts;
    console.log(`Fetched ${posts.length} posts.`);
    
    // Save raw data
    fs.writeFileSync(path.join(process.cwd(), 'seo_posts_data.json'), JSON.stringify(posts, null, 2));
    console.log('Saved data to seo_posts_data.json');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
