const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'seo_posts_data.json');
const OUTPUT_FILE = path.join(process.cwd(), 'seo_analysis_report.json');

// Stopwords list (simplified)
const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'about', 'as', 'it', 'this', 'that', 'these', 'those', 'can', 'will',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'we', 'you', 'they', 'he', 'she', 'i',
    'my', 'your', 'our', 'their', 'what', 'when', 'where', 'which', 'who', 'how', 'why', 'post', 'blog',
    'using', 'use', 'create', 'make', 'new', 'get', 'set', 'up', 'down', 'left', 'right'
]);

function extractTextFromRichText(json) {
    if (!json || !json.children) return '';
    return json.children.map(child => {
        if (child.text) return child.text;
        if (child.children) return extractTextFromRichText(child);
        return '';
    }).join(' ');
}

function getTokens(text) {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function calculateSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    let intersection = 0;
    for (const t of set1) {
        if (set2.has(t)) intersection++;
    }
    return intersection / (Math.sqrt(set1.size) * Math.sqrt(set2.size) || 1); // Cosine-ish
}

function findBestAnchorText(targetPost, sourceText) {
    // Try to find the target post's title or part of it in the source text
    const targetTokens = getTokens(targetPost.title);

    // Regex to find sentence containing best overlap
    // This is a simplified "find sentence" logic
    const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [sourceText];

    let bestSentence = '';
    let maxOverlap = 0;

    for (const sent of sentences) {
        const sentTokens = getTokens(sent);
        let overlap = 0;
        for (const t of sentTokens) {
            if (targetTokens.includes(t)) overlap++;
        }
        if (overlap > maxOverlap) {
            maxOverlap = overlap;
            bestSentence = sent.trim();
        }
    }

    if (maxOverlap > 0 && maxOverlap / targetTokens.length > 0.3) {
        return { type: 'contextual', sentence: bestSentence, rationale: `Contains keywords: ${targetTokens.slice(0, 3).join(', ')}` };
    }

    return { type: 'related', sentence: 'End of post', rationale: 'Topically related' };
}

function main() {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const posts = JSON.parse(rawData);

    console.log(`Loaded ${posts.length} posts.`);

    // Preprocess: extract tokens for all posts
    const processedPosts = posts.map(p => {
        let plainText = p.content.text || (p.content.json ? extractTextFromRichText(p.content.json) : '');
        return {
            ...p,
            plainText,
            tokens: getTokens(p.title + ' ' + plainText),
            id: p.slug
        };
    });

    // Select top 10 (most recent)
    const topPosts = processedPosts.slice(0, 10);
    const analysisResults = [];

    for (const post of topPosts) {
        const candidates = [];

        // Compare with all OTHER posts
        for (const other of processedPosts) {
            if (post.slug === other.slug) continue;

            const score = calculateSimilarity(post.tokens, other.tokens);

            // Bonus for same category
            const sameCategory = post.categories.some(c1 => other.categories.some(c2 => c1.slug === c2.slug));
            const finalScore = score + (sameCategory ? 0.2 : 0);

            candidates.push({ post: other, score: finalScore });
        }

        // Sort by score
        candidates.sort((a, b) => b.score - a.score);

        // Take top 5
        const recommendations = candidates.slice(0, 5).map(c => {
            const match = findBestAnchorText(c.post, post.plainText);
            return {
                targetTitle: c.post.title,
                targetUrl: `/post/${c.post.slug}`,
                score: c.score.toFixed(2),
                proposal: match
            };
        });

        analysisResults.push({
            title: post.title,
            url: `/post/${post.slug}`,
            recommendations
        });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysisResults, null, 2));
    console.log(`Analysis complete. Written to ${OUTPUT_FILE}`);
}

main();
