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

// Keyword patterns to detect which tags should be applied
const TAG_DETECTION_RULES = {
    // Entertainment
    'MCU & Marvel': ['marvel', 'mcu', 'avengers', 'spider-man', 'iron man', 'thor', 'captain', 'guardians', 'strange', 'multiverse', 'infinity'],
    'DC Comics Universe': ['dc', 'batman', 'superman', 'aquaman', 'flash', 'wonder woman', 'joker', 'shazam'],
    'Celebrity Lifestyle': ['celebrity', 'bollywood', 'hollywood', 'actor', 'actress', 'star', 'khan', 'kumar', 'kapoor'],
    'TV Shows & Series': ['bigg boss', 'tv show', 'series', 'episode', 'season', 'web series', 'netflix', 'amazon prime', 'hotstar'],
    'Bollywood Movies': ['bollywood', 'hindi film', 'radhe', 'brahmastra', 'gehraiyaan', 'pathaan'],
    'Hollywood Movies': ['hollywood', 'movie review', 'trailer', 'box office'],
    'Streaming Services': ['netflix', 'disney+', 'amazon prime', 'hbo', 'streaming', 'ott'],
    'Music & Artists': ['music', 'song', 'singer', 'album', 'concert'],

    // Technology
    'AI & Artificial Intelligence': ['ai ', 'artificial intelligence', 'machine learning', 'gpt', 'openai', 'neural', 'deep learning'],
    'Software Development': ['react', 'javascript', 'coding', 'programming', 'developer', 'software', 'flutter', 'next.js', 'web dev'],
    'Tutorial & Guide': ['guide', 'tutorial', 'how to', 'beginner', 'tips', 'tricks', 'step by step'],
    'Gadgets & Tech': ['gadget', 'smartphone', 'oneplus', 'poco', 'iphone', 'samsung', 'headphone', 'laptop'],

    // Sports
    'Cricket & IPL': ['cricket', 'ipl', 'csk', 'rcb', 'srh', 'kkr', 'virat kohli', 'dhoni', 'test match', 't20'],
    'Football & Soccer': ['football', 'soccer', 'premier league', 'fifa', 'ronaldo', 'messi'],
    'Sports News': ['sports', 'tournament', 'championship', 'athlete', 'olympics'],

    // Gaming
    'Esports & Competitive Gaming': ['esports', 'competitive', 'tournament', 'championship', 'pro player'],
    'Gaming News': ['gaming', 'game update', 'patch notes', 'game release'],
    'Mobile Gaming': ['bgmi', 'pubg', 'mobile game', 'pokemon go', 'free fire'],
    'Streaming & Twitch': ['twitch', 'streamer', 'pokimane', 'mortal', 'youtube gaming'],

    // General
    'News & Updates': ['news', 'latest', 'breaking', 'update', 'announces', 'report'],
    'Science & Innovation': ['science', 'research', 'discovery', 'innovation', 'technology breakthrough'],
    'Internet Culture': ['viral', 'controversy', 'feud', 'social media', 'twitter', 'instagram']
};

function detectRelevantTags(title, slug, category) {
    const text = (title + ' ' + slug).toLowerCase();
    const relevantTags = [];

    for (const [tagName, keywords] of Object.entries(TAG_DETECTION_RULES)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                relevantTags.push(tagName);
                break;
            }
        }
    }

    // Add category-based defaults if no tags found
    if (relevantTags.length === 0) {
        const defaults = {
            'Entertainment': ['Celebrity Lifestyle'],
            'Technology': ['Tutorial & Guide'],
            'Sports': ['Sports News'],
            'Gaming & Esports': ['Gaming News'],
            'News': ['News & Updates'],
            'Finance & Business': ['News & Updates'],
            'Education': ['Tutorial & Guide'],
            'Science': ['Science & Innovation']
        };

        if (defaults[category]) {
            relevantTags.push(...defaults[category]);
        }
    }

    // Limit to 3-5 tags
    return [...new Set(relevantTags)].slice(0, 5);
}

async function main() {
    console.log('=== INTELLIGENT TAG ASSIGNMENT ===\n');
    console.log('This will reassign tags based on post titles/content\n');

    // Get all tags
    const tagQuery = `query { tags { id name } }`;
    const tagData = await fetchGraphQL(tagQuery);
    const tags = tagData.data.tags;

    const tagMap = {};
    tags.forEach(tag => {
        tagMap[tag.name] = tag.id;
    });

    // Get all posts
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

    let retagged = 0;
    let errors = 0;

    for (const post of posts) {
        const category = post.categories[0]?.name;
        if (!category) continue;

        // Detect relevant tags from title/slug
        const suggestedTags = detectRelevantTags(post.title, post.slug, category);

        // Filter to tags that exist
        const validTags = suggestedTags.filter(t => tagMap[t]);

        if (validTags.length === 0) continue;

        // Check if tags need updating
        const currentTagNames = post.tags.map(t => t.name);
        const needsUpdate = JSON.stringify(validTags.sort()) !== JSON.stringify(currentTagNames.sort());

        if (!needsUpdate && post.tags.length >= 3) {
            // Already has good tags
            continue;
        }

        console.log(`\n📝 "${post.title.slice(0, 50)}..." [${category}]`);
        console.log(`   Current: ${currentTagNames.join(', ') || 'NONE'}`);
        console.log(`   Suggested: ${validTags.join(', ')}`);

        // Remove all existing tags first
        if (post.tags.length > 0) {
            for (const tag of post.tags) {
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
                await fetchGraphQL(removeMutation, {
                    postId: post.id,
                    tagId: tag.id
                });
            }
        }

        // Add new tags
        for (const tagName of validTags) {
            const addMutation = `
                mutation AddTag($postId: ID!, $tagId: ID!) {
                    updatePost(
                        where: { id: $postId }
                        data: { tags: { connect: [{ where: { id: $tagId } }] } }
                    ) {
                        id
                    }
                }
            `;

            const result = await fetchGraphQL(addMutation, {
                postId: post.id,
                tagId: tagMap[tagName]
            });

            if (result.errors) {
                console.error(`   ❌ Failed to add "${tagName}"`);
                errors++;
            }
        }

        // Publish
        await fetchGraphQL(`mutation Pub($id: ID!) { publishPost(where: {id:$id}, to: PUBLISHED) { id } }`, { id: post.id });

        console.log(`   ✅ Retagged with ${validTags.length} relevant tags`);
        retagged++;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Posts retagged:  ${retagged}`);
    console.log(`❌ Errors:         ${errors}`);
    console.log('='.repeat(70));
    console.log('\n📋 Run verify script to check improvements');
}

main().catch(err => console.error('Error:', err.message));
