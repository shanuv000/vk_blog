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
    // Tech/AI Education
    'linear-regression-coefficients-intercepts': 'Technology',

    // Politics/News
    'narendra-modi-nomination-varanasi-symbolism-strategy': 'News',
    'indian-election-2024-key-highlights-political-shifts': 'News',
    'caste-census-bjp-adapting-puncturing-opposition-politics-ready-for-numbers': 'News',
    'boycott-turkey-azerbaijan-india-economic-impact': 'News',
    'israel-qatar-strike-hamas-operation-summit-fire': 'News',
    'air-india-ahmedabad-plane-crash-june-12-2025': 'News',

    // Automotive
    'royal-enfield-hunter-350-price-guide': 'Technology',

    // Social Media/Entertainment Drama
    'neuzboy-carryminati-dhruv-rathee-abhi-and-beerbiceps-controversy-and-bias': 'Entertainment',
    'abhi-niyu-vs-dhruv-rathee-social-media-feud': 'Entertainment',
    'dhruv-rathee-abhijit-sawant-rcb-drama-neon-man-news': 'Entertainment',

    // Web Development
    'react-19-new-features-and-updates': 'Technology',

    // Sports
    'zimbabwe-afghanistan-test-day-1-takeaways-collapse': 'Sports'
};

async function main() {
    console.log('=== CATEGORIZING FINAL 13 POSTS ===\n');

    // Get category IDs
    const catQuery = `query { categories { id name } }`;
    const catData = await fetchGraphQL(catQuery);
    const categoryMap = {};
    catData.data.categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    let assigned = 0;
    let errors = 0;

    for (const [slug, categoryName] of Object.entries(ASSIGNMENTS)) {
        // Find post
        const postQuery = `
            query {
                post(where: { slug: "${slug}" }) {
                    id
                    title
                }
            }
        `;

        const postData = await fetchGraphQL(postQuery);
        const post = postData.data?.post;

        if (!post) {
            console.log(`⏭️  Not found: ${slug}`);
            continue;
        }

        const categoryId = categoryMap[categoryName];

        if (!categoryId) {
            console.error(`❌ Category not found: ${categoryName}`);
            errors++;
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
            errors++;
        } else {
            await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });
            console.log(`✅ "${post.title.slice(0, 50)}..." → ${categoryName}`);
            assigned++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Successfully assigned: ${assigned}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(70));
    console.log('\n🎉 Run count script to verify ALL posts are now categorized!');
}

main().catch(err => console.error('Error:', err.message));
