
const assert = require('assert');

// ═══════════════════════════════════════════════════════
// LOGIC TO TEST (Copy-Pasted from Requirement)
// ═══════════════════════════════════════════════════════

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
    // Mock content for testing if not raw AST
    let text = "";
    if (post.content && post.content.raw) {
        text = JSON.stringify(post.content.raw).toLowerCase();
    } else if (post.dummyContent) {
        text = post.dummyContent.toLowerCase();
    }

    // ═══════════════════════════════════════════════════════
    // RULE 1: MANDATORY "cricket" keyword check
    // ═══════════════════════════════════════════════════════

    if (!text.includes('cricket')) {
        console.log(`❌ EXCLUDED: "${post.title}" -> Reason: Missing required "cricket" keyword`);
        return false;
    }

    // ═══════════════════════════════════════════════════════
    // RULE 2: Require additional cricket-specific terminology
    // ═══════════════════════════════════════════════════════

    const specificMatches = CRICKET_SPECIFIC_TERMS.filter(term =>
        text.includes(term)
    );

    if (specificMatches.length < 1) {
        console.log(`❌ EXCLUDED: "${post.title}" -> Reason: Contains "cricket" but lacks specific terminology (Matches: ${specificMatches.length})`);
        return false;
    }

    // ═══════════════════════════════════════════════════════
    // RULE 3: EXCLUDE non-sports categories
    // ═══════════════════════════════════════════════════════

    for (const [category, keywords] of Object.entries(EXCLUDE_CATEGORIES)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                console.log(`❌ EXCLUDED: "${post.title}" -> Reason: Belongs to category: ${category} (Keyword: ${keyword})`);
                return false;
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // RULE 4: Additional validation - title check
    // ═══════════════════════════════════════════════════════

    const title = post.title.toLowerCase();
    const titleHasCricket = title.includes('cricket') ||
        title.includes('ipl') ||
        title.includes('bcci') ||
        title.includes('test match') ||
        title.includes('odi') ||
        title.includes('t20');

    if (!titleHasCricket && specificMatches.length < 3) {
        console.log(`⚠️  WARNING: "${post.title}" -> Title lacks cricket keywords, body has <3 matches. REJECTING.`);
        // Still return false for safety
        return false;
    }

    // ═══════════════════════════════════════════════════════
    // PASSED: Post is cricket-related
    // ═══════════════════════════════════════════════════════

    console.log(`✅ INCLUDED: "${post.title}" -> Matched cricket terms: ${specificMatches.join(', ')}`);
    return true;
}

// ═══════════════════════════════════════════════════════
// TEST CASES
// ═══════════════════════════════════════════════════════

const testCases = [
    // --- SHOULD PASS ---
    {
        title: "India vs Australia Test Match Preview",
        dummyContent: "Cricket fans are excited for the upcoming test series between India vs Australia. The batsmen are ready.",
        expected: true
    },
    {
        title: "IPL 2022 Updates",
        dummyContent: "The IPL tournament is starting soon. BCCI announced the dates. Cricket lovers are happy.",
        expected: true
    },
    {
        title: "Virat Kohli Scores Century",
        dummyContent: "Indian cricket captain Virat Kohli scored a massive century in the ODI match today. His innings was widely celebrated by fans and the BCCI alike. He smashed boundaries all over the park.",
        expected: true
    },

    // --- SHOULD FAIL (False Positives from before) ---
    {
        title: "Apex Legends Tournament Finals",
        dummyContent: "The gaming league tournament finals for Apex Legends are here. Snipe the enemy.",
        expected: false
    },
    {
        title: "Netaji Tribute Event",
        dummyContent: "India pays homage to the freedom fighter Netaji. The whole world is watching this tribute.",
        expected: false
    },
    {
        title: "Mental Health Tips",
        dummyContent: "Dealing with depression and anxiety. It's important to talk about mental health.",
        expected: false
    },
    {
        title: "Flutter Strategy 2026",
        dummyContent: "The roadmap for Flutter and Dart. Programming is fun.",
        expected: false
    },
    {
        title: "MongoDB Memory Leak",
        dummyContent: "Database issues with MongoDB. The software is crashing.",
        expected: false
    },

    // --- EDGE CASES ---
    {
        title: "Cricket but also Movie Review",
        dummyContent: "I watched a movie about cricket. Ideally should act based on movie keywords. Contains bollywood actor.",
        expected: false // Should fail due to 'movie' or 'bollywood' exclusion
    },
    {
        title: "Generic Sports News",
        dummyContent: "Sports news updates. No specific mention of cricket terms just generic.",
        expected: false // No cricket keyword
    },
    {
        title: "Cricket Mention only once",
        dummyContent: "I like cricket.",
        expected: false // Fails Rule 2 (<1 specific term) and likely Rule 4 (<3 matches + no title match)
    }
];

// Run Tests
console.log("\n🧪 RUNNING UNIT TESTS...\n");
let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    console.log(`Test #${index + 1}: ${test.title}`);
    const result = isCricketRelated(test);

    if (result === test.expected) {
        console.log(`PASSED ✅\n`);
        passed++;
    } else {
        console.log(`FAILED ❌ (Expected: ${test.expected}, Got: ${result})\n`);
        failed++;
    }
});

console.log(`\n📊 RESULTS: ${passed}/${testCases.length} Passed`);

if (failed > 0) {
    console.error("❌ Some tests failed! strict filtering logic needs adjustment.");
    process.exit(1);
} else {
    console.log("✅ All tests passed! Logic is safe to deploy.");
}
