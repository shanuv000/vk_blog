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

// Slug to Category mapping
const ASSIGNMENTS = {
    'valorant-players-can-use-sound-radius-circle-to-line-up-viper-snake-bite-ability': 'Gaming & Esports',
    'poco-f3-gt-vs-oneplus-nord-2-specs-prices-and-features-compared': 'Technology',
    'pokimane-hits-back-at-claims-that-jidion-drama-was-just-a-joke': 'Entertainment',
    'all-recent-platform-companies-that-listed-trading-below-listing-price': 'Finance & Business',
    'in-a-first-kidneys-from-a-genetically-altered-pig-successfully-implanted-in-brain-dead-man-in-the-us': 'Science',
    'anish-giri-i-have-had-it-all-in-wijk-aan-zee': 'Sports',
    'cyberbullying-prevention': 'Education',
    'ipl-to-begin-from-last-week-of-march': 'Sports',
    'issue-pairing-sony-bluetooth-wireless-headphones': 'Technology'
};

async function main() {
    console.log('=== CATEGORIZING REMAINING POSTS ===\n');

    // Get category IDs
    const catQuery = `query { categories { id name } }`;
    const catData = await fetchGraphQL(catQuery);
    const categoryMap = {};
    catData.data.categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    console.log('Available categories:');
    Object.keys(categoryMap).forEach(name => console.log(`  - ${name}`));
    console.log('');

    let assigned = 0;
    let notFound = 0;

    for (const [slug, categoryName] of Object.entries(ASSIGNMENTS)) {
        // Find post
        const postQuery = `
            query {
                post(where: { slug: "${slug}" }) {
                    id
                    title
                    categories {
                        name
                    }
                }
            }
        `;

        const postData = await fetchGraphQL(postQuery);
        const post = postData.data?.post;

        if (!post) {
            console.log(`⏭️  Not found: ${slug}`);
            notFound++;
            continue;
        }

        if (post.categories && post.categories.length > 0) {
            console.log(`⏭️  Already has category: "${post.title.slice(0, 40)}..." → ${post.categories[0].name}`);
            continue;
        }

        const categoryId = categoryMap[categoryName];

        if (!categoryId) {
            console.error(`❌ Category not found: ${categoryName}`);
            continue;
        }

        // Assign category
        const updateMutation = `
            mutation UpdatePost($postId: ID!, $categoryId: ID!) {
                updatePost(
                    where: { id: $postId }
                    data: { categories: { connect: [{ where: { id: $categoryId } }] } }
                ) {
                    id
                }
            }
        `;

        const result = await fetchGraphQL(updateMutation, {
            postId: post.id,
            categoryId: categoryId
        });

        if (result.errors) {
            console.error(`❌ "${post.title.slice(0, 30)}...":`, result.errors[0].message);
        } else {
            await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });
            console.log(`✅ "${post.title.slice(0, 45)}..." → ${categoryName}`);
            assigned++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Assigned: ${assigned}`);
    console.log(`⏭️  Not found/skipped: ${notFound}`);
    console.log('='.repeat(70));
    console.log('\n📋 Run count script to verify final state');
}

main().catch(err => console.error('Error:', err.message));
