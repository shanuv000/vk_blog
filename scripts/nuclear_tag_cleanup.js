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

// Define which tags are ALLOWED per category
const CATEGORY_TAG_WHITELIST = {
    'Entertainment': [
        'MCU & Marvel',
        'DC Comics Universe',
        'Celebrity Lifestyle',
        'TV Shows & Series',
        'Bollywood Movies',
        'Hollywood Movies',
        'Streaming Services',
        'Music & Artists',
        'Internet Culture' // cross-category
    ],

    'Technology': [
        'AI & Artificial Intelligence',
        'Software Development',
        'Tutorial & Guide',
        'Gadgets & Tech',
        'Cybersecurity',
        'Web3 & Blockchain',
        'Internet Culture' // cross-category
    ],

    'Sports': [
        'Cricket & IPL',
        'Football & Soccer',
        'Sports News',
        'News & Updates'
    ],

    'Gaming & Esports': [
        'Esports & Competitive Gaming',
        'Gaming News',
        'Mobile Gaming',
        'PC Gaming',
        'Streaming & Twitch',
        'Game Reviews',
        'Internet Culture' // cross-category
    ],

    'News': [
        'News & Updates',
        'Opinion & Analysis',
        'Internet Culture' // cross-category
    ],

    'Finance & Business': [
        'News & Updates',
        'Opinion & Analysis'
    ],

    'Education': [
        'Tutorial & Guide',
        'Science & Innovation'
    ],

    'LifeStyle': [
        'Celebrity Lifestyle',
        'Opinion & Analysis'
    ],

    'Science': [
        'Science & Innovation',
        'AI & Artificial Intelligence',
        'Tutorial & Guide'
    ]
};

async function main() {
    console.log('=== NUCLEAR TAG CLEANUP ===\n');
    console.log('This will remove tags that don\'t match post categories\n');

    // Get all posts with categories and tags
    const postsQuery = `
        query {
            posts(first: 300) {
                id
                title
                slug
                categories {
                    name
                }
                tags {
                    id
                    name
                }
            }
        }
    `;

    const postsData = await fetchGraphQL(postsQuery);
    const posts = postsData.data.posts;

    console.log(`Processing ${posts.length} posts...\n`);

    let cleaned = 0;
    let tagsRemoved = 0;
    let errors = 0;

    for (const post of posts) {
        if (!post.categories || post.categories.length === 0) {
            console.log(`⏭️  Skipped (no category): "${post.title.slice(0, 40)}..."`);
            continue;
        }

        const category = post.categories[0].name;
        const allowedTags = CATEGORY_TAG_WHITELIST[category] || [];

        // Find tags that shouldn't be on this post
        const invalidTags = post.tags.filter(tag => !allowedTags.includes(tag.name));

        if (invalidTags.length === 0) {
            // Post is clean
            continue;
        }

        console.log(`\n📝 "${post.title.slice(0, 45)}..." [${category}]`);
        console.log(`   Removing ${invalidTags.length} invalid tags:`);

        // Remove each invalid tag
        for (const tag of invalidTags) {
            console.log(`   ❌ ${tag.name}`);

            const removeMutation = `
                mutation RemoveTag($postId: ID!, $tagId: ID!) {
                    updatePost(
                        where: { id: $postId }
                        data: { tags: { disconnect: [{ id: $tagId }] } }
                    ) {
                        id
                    }
                }
            `;

            const result = await fetchGraphQL(removeMutation, {
                postId: post.id,
                tagId: tag.id
            });

            if (result.errors) {
                console.error(`      ⚠️  Failed to remove`);
                errors++;
            } else {
                tagsRemoved++;
            }
        }

        // Publish changes
        await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });

        const remaining = post.tags.length - invalidTags.length;
        console.log(`   ✅ Cleaned (${remaining} valid tags remaining)`);
        cleaned++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Posts cleaned:        ${cleaned}`);
    console.log(`🗑️  Tags removed:        ${tagsRemoved}`);
    console.log(`❌ Errors:              ${errors}`);
    console.log('='.repeat(70));
    console.log('\n📋 Run audit script to see final tag distribution');
}

main().catch(err => {
    console.error('\n❌ Fatal Error:', err.message);
    console.error(err.stack);
});
