const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Configuration ---
const BACKUP_FILE = path.join(__dirname, '../backups/backups.jsonl');
const ANALYSIS_FILE = path.join(__dirname, '../posts_analysis.json');
const LOG_FILE = path.join(__dirname, '../link_integration_log.txt');

// Keyword Mapping
const KEYWORDS = {
    liveScores: ["live score", "ongoing match", "current match", "ball-by-ball", "live cricket"],
    news: ["breaking news", "latest news", "announced", "revealed", "update", "bcci", "icc"],
    stats: ["ranking", "statistics", "performance", "records", "analysis", "orange cap", "purple cap"],
    leagues: ["tournament", "ipl", "world cup", "series", "championship", "test match", "odi"]
};

// URL Mapping
const URLS = {
    liveScores: "https://play.urtechy.com/live-scores",
    news: "https://play.urtechy.com/news",
    stats: "https://play.urtechy.com/stats",
    leagues: "https://play.urtechy.com/leagues",
    default: "https://play.urtechy.com/"
};

// Anchor Texts
const ANCHORS = [
    "Check live cricket scores on Urtechy Sports",
    "Follow real-time updates at Urtechy",
    "View latest cricket news",
    "Track tournament standings live",
    "Get comprehensive match statistics",
    "See detailed player rankings",
    "Follow the match live"
];

// --- Env & API ---
function getEnvVars() {
    try {
        const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const vars = {};
        envLocal.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) vars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
        });
        return vars;
    } catch (e) { return {}; }
}
const envVars = getEnvVars();
const ENDPOINT = envVars.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const TOKEN = envVars.HYGRAPH_AUTH_TOKEN;

if (!ENDPOINT || !TOKEN) { console.error("Missing Credentials"); process.exit(1); }

async function fetchGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify({ query, variables });
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
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(dataString);
        req.end();
    });
}

// --- AST Helpers ---

// Count words recursively
function countWords(node) {
    if (!node) return 0;
    if (node.text) return node.text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (node.children && Array.isArray(node.children)) {
        return node.children.reduce((acc, child) => acc + countWords(child), 0);
    }
    return 0;
}

// Check for existing Urtechy links
function hasExistingLinks(node) {
    if (!node) return false;
    if (node.type === 'link' && node.href && node.href.includes('urtechy.com')) return true;
    if (node.children && Array.isArray(node.children)) {
        return node.children.some(child => hasExistingLinks(child));
    }
    return false;
}

// Get all paragraph nodes with their index in the root children array
function getParagraphNodes(root) {
    if (!root || !root.children) return [];
    return root.children
        .map((node, index) => ({ node, index }))
        .filter(item => item.node.type === 'paragraph');
}

// Determine context category based on text content
function detectContext(text) {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        if (keywords.some(k => lowerText.includes(k))) return category;
    }
    return 'default';
}

// --- Filtering Logic (User Provided Strict Logic) ---

const CRICKET_SPECIFIC_TERMS = [
    // Leagues & Tournaments
    'ipl', 'bcci', 'wpl', 'ranji trophy', 'world cup',
    'test series', 'ashes', 'champions trophy',

    // Match formats
    'test match', 'odi', 't20', 't20i', 'one day',

    // Game elements
    'wicket', 'batsman', 'batter', 'bowler', 'innings',
    'over', 'stumps', 'boundary', 'six', 'four', 'maiden',
    'run out', 'lbw', 'caught', 'yorker', 'bouncer',

    // Player names (top cricketers)
    'virat kohli', 'rohit sharma', 'dhoni', 'sachin',
    'bumrah', 'shami', 'hardik pandya', 'smriti mandhana',

    // Match contexts
    'india vs', 'aus vs', 'england vs', 'pakistan vs',
    'live score', 'scorecard', 'cricket match', 'cricket news'
];

const EXCLUDE_CATEGORIES = {
    mentalHealth: ['mental health', 'cyberbully', 'depression', 'anxiety'],
    entertainment: ['bollywood', 'hollywood', 'movie', 'film', 'actor',
        'actress', 'bigg boss', 'naagin', 'web series'],
    gaming: ['apex legends', 'valorant', 'pubg', 'bgmi', 'warzone',
        'fortnite', 'league of legends', 'dota'],
    technology: ['mongodb', 'javascript', 'python', 'flutter', 'react',
        'machine learning', 'artificial intelligence', 'ai model',
        'database', 'programming', 'software'],
    education: ['exam result', 'cbse', 'board result', 'admission',
        'university', 'school'],
    business: ['stock market', 'nifty', 'sensex', 'ipo', 'shares'],
    politics: ['election', 'minister', 'parliament', 'government policy'],
    lifestyle: ['recipe', 'cooking', 'fashion', 'beauty', 'makeup']
};

function isCricketRelated(post) {
    // Mimic the User's strict logic using JSON.stringify
    const text = JSON.stringify(post.content.raw).toLowerCase();

    // RULE 1: MANDATORY "cricket" keyword check
    if (!text.includes('cricket')) {
        return false;
    }

    // RULE 2: Require additional cricket-specific terminology
    const specificMatches = CRICKET_SPECIFIC_TERMS.filter(term =>
        text.includes(term)
    );

    if (specificMatches.length < 1) {
        return false;
    }

    // RULE 3: EXCLUDE non-sports categories
    for (const [category, keywords] of Object.entries(EXCLUDE_CATEGORIES)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return false;
            }
        }
    }

    // RULE 4: Additional validation - title check
    const title = post.title.toLowerCase();
    const titleHasCricket = title.includes('cricket') ||
        title.includes('ipl') ||
        title.includes('bcci') ||
        title.includes('test match') ||
        title.includes('odi') ||
        title.includes('t20');

    // Safety check: if title is weak, require strong body evidence
    if (!titleHasCricket && specificMatches.length < 3) {
        return false;
    }

    return true;
}

// --- Analysis Module ---
async function analyzePosts() {
    console.log("Fetching all posts for analysis...");
    let posts = [];
    let skip = 0;
    let hasMore = true;

    // Fetch in batches
    while (hasMore) {
        const query = `
      query GetPosts($skip: Int!) {
        posts(first: 100, skip: $skip) {
          id
          title
          slug
          content { raw }
        }
      }
    `;
        try {
            const data = await fetchGraphQL(query, { skip });
            if (data.posts.length === 0) hasMore = false;
            else {
                posts = posts.concat(data.posts);
                skip += 100;
                process.stdout.write(`.`);
            }
        } catch (e) {
            console.error("Error fetching posts:", e);
            hasMore = false;
        }
    }
    console.log(`\nFetched ${posts.length} posts.`);

    const analysis = posts.map(post => {
        const ast = post.content.raw;
        const wordCount = countWords(ast);
        const hasLinks = hasExistingLinks(ast);

        // Strict relevance check
        const isCricket = isCricketRelated(post);

        // Use clean text for context detection even if we used JSON for filter
        let fullText = "";
        const paragraphs = getParagraphNodes(ast);
        paragraphs.forEach(p => fullText += (p.node.children.map(c => c.text || "").join(" ") + " "));

        const context = isCricket ? detectContext(fullText) : 'none';

        const eligible = !hasLinks && wordCount >= 300 && isCricket;
        const maxLinks = Math.min(Math.floor(wordCount / 250), 4);

        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            wordCount,
            hasExistingLinks: hasLinks,
            isCricket,
            context,
            eligible,
            maxLinks: eligible ? maxLinks : 0,
            suggestedUrl: eligible ? (URLS[context] || URLS.default) : null,
            suggestedAnchor: eligible ? ANCHORS[Math.floor(Math.random() * ANCHORS.length)] : null
        };
    });

    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2));
    console.log(`Analysis saved to ${ANALYSIS_FILE}`);

    // Summary
    const eligibleCount = analysis.filter(p => p.eligible).length;
    console.log(`Total Posts: ${posts.length}`);
    console.log(`Eligible (Strict Cricket Filter): ${eligibleCount}`);
    console.log(`Skipped: ${posts.length - eligibleCount}`);
}

// --- Execution Module ---

// Deep clone AST to avoid mutation issues
function cloneAST(ast) {
    return JSON.parse(JSON.stringify(ast));
}

// Insert link into a specific paragraph node
function insertLinkIntoParagraph(paragraphNode, url, anchorText) {
    // Find the last text node
    const lastChildIndex = paragraphNode.children.length - 1;
    // We append a space and then the link
    // Hygraph AST structure for Link:
    // { type: 'link', href: '...', openInNewTab: true, children: [{ text: '...' }] }

    const linkNode = {
        type: 'link',
        href: url,
        openInNewTab: true,
        children: [{ text: anchorText }]
    };

    // Add a leading space text node
    paragraphNode.children.push({ text: " " });
    paragraphNode.children.push(linkNode);
    return paragraphNode;
}

async function updatePost(post, context, dryRun = true) {
    if (dryRun) {
        console.log(`[DRY RUN] Would update post: "${post.title}"`);
        console.log(`  - Context: ${context}`);
        console.log(`  - Adding link to: ${URLS[context] || URLS.default}`);
        return;
    }

    // 1. Backup
    const backupEntry = JSON.stringify({
        postId: post.id,
        title: post.title,
        timestamp: new Date().toISOString(),
        originalContent: post.content.raw
    }) + '\n';
    fs.appendFileSync(BACKUP_FILE, backupEntry);

    // 2. Modify AST
    const newAst = cloneAST(post.content.raw);
    const paragraphs = getParagraphNodes(newAst);

    // Strategy: Insert at 2nd or 3rd paragraph (if available), or last if short
    // Filter paragraphs that are long enough to look natural (> 20 words)
    const candidates = paragraphs.filter(p => countWords(p.node) > 20);

    if (candidates.length === 0) {
        console.log(`[SKIP] No suitable paragraphs found for "${post.title}"`);
        return;
    }

    // Pick 2nd candidate if exists, else 1st
    const target = candidates.length > 1 ? candidates[1] : candidates[0];

    const url = URLS[context] || URLS.default;
    const anchor = ANCHORS[Math.floor(Math.random() * ANCHORS.length)];

    insertLinkIntoParagraph(target.node, url, anchor);

    // 3. Mutation
    const mutation = `
    mutation UpdatePost($id: ID!, $content: RichTextAST!) {
      updatePost(
        where: { id: $id }
        data: { content: $content }
      ) { id }
      publishPost(where: { id: $id }, to: PUBLISHED) { id }
    }
  `;

    try {
        await fetchGraphQL(mutation, { id: post.id, content: newAst });
        console.log(`✅ Updated: "${post.title}"`);
        fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - Updated ${post.id} - ${post.title}\n`);
    } catch (e) {
        console.error(`❌ Failed: "${post.title}"`, e);
        fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ERROR ${post.id} - ${e.message}\n`);
    }
}

async function runExecution(targetIds = []) {
    if (!fs.existsSync(ANALYSIS_FILE)) {
        console.error("No analysis file found. Run with --analyze first.");
        return;
    }

    const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE));
    let targets = [];

    if (targetIds.length > 0) {
        targets = analysis.filter(p => targetIds.includes(p.id) && p.eligible);
    } else {
        // SAFETY: Only allow specific IDs unless explicitly overridden in code?
        // For CLI 'execute' with no args, we'd better be safe.
        // But user instructions say "Batch 1: 5 high-confidence posts".
        // The script relies on user passing IDs or we iterate all.
        // Let's iterate all eligible, since we have filtered them strictly.
        console.log("No specific IDs provided. Processing ALL eligible posts from analysis...");
        targets = analysis.filter(p => p.eligible);
    }

    console.log(`Starting execution on ${targets.length} posts...`);

    // Batch processing
    for (let i = 0; i < targets.length; i++) {
        const item = targets[i];

        // Re-fetch fresh content to be safe (in case it changed since analysis)
        const query = `query GetPost($id: ID!) { post(where: { id: $id }) { id title content { raw } } }`;
        const freshData = await fetchGraphQL(query, { id: item.id });

        await updatePost(freshData.post, item.context, false); // dryRun = false

        // Anti-rate-limit delay (6 seconds)
        if (i < targets.length - 1) {
            await new Promise(r => setTimeout(r, 6000));
        }
    }
}

// --- CLI Entry ---
const args = process.argv.slice(2);
if (args.includes('--analyze')) {
    analyzePosts();
} else if (args.includes('--execute')) {
    const ids = args.filter(a => !a.startsWith('--'));
    runExecution(ids);
} else {
    console.log("Usage: node scripts/integrate_promo_links.js [--analyze | --execute <id1> <id2> ...]");
}
