const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'seo_posts_data.json');
const OUTPUT_FILE = path.join(process.cwd(), 'clustered_links_candidates.json');

const CLUSTERS = {
    'Gaming/Battle Royale': ['bgmi', 'apex', 'legends', 'warzone', 'minecraft', 'gta', 'game', 'gaming', 'playstation', 'xbox', 'nintendo', 'ps5', 'pubg', 'fortnite', 'esports', 'mortal', 'pokemon'],
    'Web Dev/Security': ['react', 'next.js', 'javascript', 'cve', 'vulnerability', 'code', 'developer', 'api', 'mongo', 'database', 'flutter', 'css', 'html', 'frontend', 'backend', 'fullstack', 'hack', 'exploit', 'security', 'linux', 'programming'],
    'Finance/Tech Business': ['sip', 'inflows', 'ipo', 'trade', 'stock', 'market', 'price', 'business', 'startup', 'microsoft', 'openai', 'economy', 'inflation', 'invest', 'crypto', 'bitcoin', 'bank', 'revenue', 'profit', 'dram', 'supply', 'demand', 'cost'],
    'Entertainment': ['hbo', 'max', 'movie', 'trailer', 'film', 'cinema', 'marvel', 'dc', 'show', 'series', 'netflix', 'disney', 'actor', 'actress', 'star', 'celebrity', 'hollywood', 'bollywood', 'release', 'streaming', 'watch'],
    'General News': [] // Fallback
};

function getTokens(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

function assignCluster(post) {
    const text = (post.title + ' ' + (post.content.text || '')).toLowerCase();

    // Check specific clusters first
    for (const [cluster, keywords] of Object.entries(CLUSTERS)) {
        if (cluster === 'General News') continue;

        // Check for title keywords (higher weight)
        for (const kw of keywords) {
            if (post.title.toLowerCase().includes(kw)) return cluster;
        }

        // Check content (lower weight, need multiple matches maybe? for now strict on title/slug/topic mostly)
        // Let's stick to title/category matches effectively for safety
    }

    // Check categories if available
    if (post.categories) {
        for (const cat of post.categories) {
            const catSlug = cat.slug.toLowerCase();
            if (['gaming', 'games', 'esports'].some(k => catSlug.includes(k))) return 'Gaming/Battle Royale';
            if (['tech', 'programming', 'code', 'security'].some(k => catSlug.includes(k))) return 'Web Dev/Security';
            if (['finance', 'business', 'money'].some(k => catSlug.includes(k))) return 'Finance/Tech Business';
            if (['entertainment', 'movies', 'tv'].some(k => catSlug.includes(k))) return 'Entertainment';
        }
    }

    return 'General News';
}

function calculateSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    let intersection = 0;
    for (const t of set1) {
        if (set2.has(t)) intersection++;
    }
    return intersection / (Math.sqrt(set1.size) * Math.sqrt(set2.size) || 1);
}

function main() {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const posts = JSON.parse(rawData);

    // Assign clusters
    const clusteredPosts = posts.map(p => ({
        ...p,
        cluster: assignCluster(p),
        tokens: getTokens(p.title + ' ' + (p.content.text || ''))
    }));

    // Top 10 posts to analyze
    const top10 = clusteredPosts.slice(0, 10);
    const results = [];

    for (const post of top10) {
        if (post.cluster === 'General News') {
            // Try harder to classify based on tokens? No, user said classify "Teen pilot" as General News.
        }

        // Find candidates in same cluster
        const candidates = clusteredPosts.filter(p =>
            p.slug !== post.slug &&
            p.cluster === post.cluster // STRICT CLUSTER MATCH
        );

        // Sort by similarity
        candidates.sort((a, b) => {
            const simA = calculateSimilarity(post.tokens, a.tokens);
            const simB = calculateSimilarity(post.tokens, b.tokens);
            return simB - simA;
        });

        results.push({
            title: post.title,
            url: `/post/${post.slug}`,
            cluster: post.cluster,
            candidates: candidates.slice(0, 5).map(c => ({
                title: c.title,
                url: `/post/${c.slug}`,
                date: c.publishedAt
            }))
        });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Clustered analysis complete. Written to ${OUTPUT_FILE}`);
}

main();
