const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// --- Configuration ---
const BACKUP_FILE = path.join(__dirname, '../backups/backups.jsonl');
const BATCH_SIZE = 1; // Safety first

function getEnvVars() {
    try {
        const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const vars = {};
        envLocal.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
        });
        return vars;
    } catch (e) {
        console.error("Could not read .env.local");
        return {};
    }
}

const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

if (!ENDPOINT || !TOKEN) {
    console.error("Missing Hygraph Credentials in .env.local");
    process.exit(1);
}

// --- Hygraph Mutation ---
async function restorePost(postId, rawContent) {
    const mutation = `
    mutation UpdatePost($id: ID!, $content: RichTextAST!) {
      updatePost(
        where: { id: $id }
        data: { content: $content }
      ) {
        id
        slug
        title
      }
      publishPost(where: { id: $id }, to: PUBLISHED) {
        id
      }
    }
  `;

    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({
            query: mutation,
            variables: { id: postId, content: rawContent }
        });
        const url = new URL(ENDPOINT);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            }
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.errors) reject(json.errors);
                    else resolve(json.data);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(dataString);
        req.end();
    });
}

// --- Main Logic ---
async function main() {
    const targetPostId = process.argv[2];

    if (!targetPostId) {
        console.log("Usage: node scripts/rollback_links.js <postId>");
        console.log("Or: node scripts/rollback_links.js --all (Dangerous!)");
        process.exit(1);
    }

    if (!fs.existsSync(BACKUP_FILE)) {
        console.error(`Backup file not found at: ${BACKUP_FILE}`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(BACKUP_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    console.log(`Searching backup for Post ID: ${targetPostId}...`);
    let found = false;

    for await (const line of rl) {
        try {
            const record = JSON.parse(line);
            if (record.postId === targetPostId) {
                found = true;
                console.log(`Found backup for "${record.title}" (Timestamp: ${record.timestamp})`);
                console.log(`Restoring original content...`);

                try {
                    await restorePost(targetPostId, record.originalContent);
                    console.log(`✅ Successfully restored post: ${targetPostId}`);
                } catch (err) {
                    console.error(`❌ Failed to restore post: ${targetPostId}`, err);
                }
                break; // Found the specific post
            }
        } catch (e) {
            console.error("Skipping malformed backup line");
        }
    }

    if (!found) {
        console.error(`❌ No backup found for Post ID: ${targetPostId}`);
    }
}

main();
