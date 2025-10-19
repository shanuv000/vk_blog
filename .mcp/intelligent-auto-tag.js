import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Enhanced tag matching with weighted scoring system
const TAG_RULES = {
  // Technology Tags
  "ai-artificial-intelligence": {
    primary: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "chatgpt",
      "openai",
      "gpt",
      "llm",
      "neural network",
    ],
    secondary: [
      "deep learning",
      "nlp",
      "computer vision",
      "generative",
      "automation",
      "algorithm",
    ],
    categories: ["technology"],
    weight: 10,
  },
  "web3-blockchain": {
    primary: [
      "web3",
      "blockchain",
      "crypto",
      "cryptocurrency",
      "nft",
      "bitcoin",
      "ethereum",
      "defi",
    ],
    secondary: [
      "metaverse",
      "decentralized",
      "smart contract",
      "token",
      "mining",
      "wallet",
    ],
    categories: ["technology"],
    weight: 10,
  },
  "gadgets-tech": {
    primary: [
      "gadget",
      "smartphone",
      "laptop",
      "tablet",
      "phone",
      "iphone",
      "samsung",
      "oneplus",
      "pixel",
      "xiaomi",
    ],
    secondary: [
      "device",
      "earbuds",
      "smartwatch",
      "wearable",
      "specs",
      "review",
      "launch",
      "price",
    ],
    categories: ["technology"],
    weight: 8,
  },
  "science-innovation": {
    primary: [
      "science",
      "research",
      "discovery",
      "space",
      "nasa",
      "isro",
      "quantum",
      "physics",
    ],
    secondary: [
      "innovation",
      "breakthrough",
      "experiment",
      "scientist",
      "study",
      "technology advance",
    ],
    categories: ["technology", "science"],
    weight: 9,
  },
  cybersecurity: {
    primary: [
      "cybersecurity",
      "security",
      "hack",
      "hacking",
      "breach",
      "malware",
      "ransomware",
      "phishing",
    ],
    secondary: [
      "privacy",
      "encryption",
      "vulnerability",
      "cyber attack",
      "data leak",
      "password",
      "threat",
    ],
    categories: ["technology"],
    weight: 9,
  },
  "cloud-computing": {
    primary: ["cloud", "aws", "azure", "google cloud", "cloud computing"],
    secondary: [
      "saas",
      "paas",
      "iaas",
      "serverless",
      "infrastructure",
      "hosting",
    ],
    categories: ["technology"],
    weight: 8,
  },
  "software-development": {
    primary: [
      "developer",
      "programming",
      "coding",
      "software",
      "javascript",
      "python",
      "react",
      "next.js",
      "node.js",
    ],
    secondary: [
      "app development",
      "web development",
      "code",
      "framework",
      "api",
      "github",
      "open source",
    ],
    categories: ["technology"],
    weight: 9,
  },
  "internet-culture": {
    primary: [
      "meme",
      "viral",
      "social media",
      "twitter",
      "instagram",
      "tiktok",
      "youtube",
    ],
    secondary: ["trend", "internet", "online", "influencer", "content creator"],
    categories: ["technology", "entertainment"],
    weight: 7,
  },

  // Gaming Tags
  "esports-competitive": {
    primary: [
      "esports",
      "competitive gaming",
      "tournament",
      "championship",
      "esport",
    ],
    secondary: ["pro player", "team", "league", "competitive", "prize pool"],
    categories: ["gaming", "esports"],
    weight: 9,
  },
  "game-reviews": {
    primary: ["game review", "rating", "worth playing", "gameplay review"],
    secondary: ["graphics", "storyline", "mechanics", "score", "verdict"],
    categories: ["gaming"],
    weight: 8,
  },
  "streaming-twitch": {
    primary: ["twitch", "streamer", "streaming", "live stream", "twitch tv"],
    secondary: [
      "youtube gaming",
      "stream",
      "broadcaster",
      "streaming platform",
    ],
    categories: ["gaming"],
    weight: 8,
  },
  "mobile-gaming": {
    primary: [
      "mobile game",
      "bgmi",
      "pubg mobile",
      "free fire",
      "cod mobile",
      "mobile gaming",
    ],
    secondary: ["android game", "ios game", "phone game", "mobile esports"],
    categories: ["gaming"],
    weight: 9,
  },
  "console-gaming": {
    primary: [
      "playstation",
      "ps5",
      "ps4",
      "xbox",
      "nintendo",
      "switch",
      "console",
    ],
    secondary: ["exclusive", "controller", "sony", "microsoft gaming"],
    categories: ["gaming"],
    weight: 8,
  },
  "pc-gaming": {
    primary: [
      "pc gaming",
      "steam",
      "gaming pc",
      "graphics card",
      "rtx",
      "nvidia",
      "amd",
    ],
    secondary: ["epic games", "pc exclusive", "gaming laptop", "fps"],
    categories: ["gaming"],
    weight: 8,
  },
  "gaming-news": {
    primary: [
      "game release",
      "game launch",
      "game announcement",
      "game update",
      "new game",
    ],
    secondary: [
      "patch notes",
      "dlc",
      "expansion",
      "gaming news",
      "release date",
    ],
    categories: ["gaming"],
    weight: 7,
  },

  // Entertainment Tags
  "mcu-marvel": {
    primary: [
      "marvel",
      "mcu",
      "avengers",
      "spider-man",
      "iron man",
      "thor",
      "captain america",
      "marvel studios",
    ],
    secondary: [
      "deadpool",
      "x-men",
      "marvel cinematic",
      "phase",
      "multiverse",
      "kevin feige",
    ],
    categories: ["entertainment", "movies", "tv-shows"],
    weight: 10,
  },
  "dc-comics": {
    primary: [
      "dc",
      "batman",
      "superman",
      "wonder woman",
      "justice league",
      "dc comics",
      "dceu",
    ],
    secondary: ["aquaman", "flash", "joker", "harley quinn", "gotham", "wayne"],
    categories: ["entertainment", "movies", "tv-shows"],
    weight: 10,
  },
  "bollywood-movies": {
    primary: ["bollywood", "hindi movie", "hindi film", "bollywood star"],
    secondary: [
      "srk",
      "salman khan",
      "aamir khan",
      "akshay kumar",
      "shah rukh",
      "ranbir",
      "alia",
    ],
    categories: ["entertainment", "movies"],
    weight: 9,
  },
  "hollywood-movies": {
    primary: ["hollywood", "hollywood movie", "hollywood film", "box office"],
    secondary: ["movie", "film", "cinema", "blockbuster", "oscar"],
    categories: ["entertainment", "movies"],
    weight: 7,
  },
  "streaming-services": {
    primary: [
      "netflix",
      "amazon prime",
      "disney+",
      "hotstar",
      "disney plus",
      "prime video",
    ],
    secondary: ["hbo", "apple tv+", "streaming", "ott", "subscription"],
    categories: ["entertainment"],
    weight: 8,
  },
  "tv-shows-series": {
    primary: ["tv show", "series", "web series", "season", "episode"],
    secondary: [
      "finale",
      "premiere",
      "renewal",
      "canceled",
      "streaming series",
    ],
    categories: ["entertainment", "tv-shows"],
    weight: 8,
  },
  "music-artists": {
    primary: ["music", "song", "album", "singer", "artist", "musician"],
    secondary: [
      "band",
      "concert",
      "spotify",
      "streaming music",
      "hit song",
      "music video",
    ],
    categories: ["entertainment", "music"],
    weight: 8,
  },
  "celebrity-lifestyle": {
    primary: ["celebrity", "actor", "actress", "star"],
    secondary: [
      "lifestyle",
      "red carpet",
      "awards",
      "gossip",
      "relationship",
      "marriage",
      "engagement",
    ],
    categories: ["entertainment", "celebrity-news"],
    weight: 7,
  },

  // Sports Tags
  "cricket-ipl": {
    primary: [
      "cricket",
      "ipl",
      "world cup",
      "t20",
      "test match",
      "odi",
      "bcci",
    ],
    secondary: [
      "virat kohli",
      "rohit sharma",
      "dhoni",
      "india cricket",
      "csk",
      "rcb",
      "mi",
    ],
    categories: ["sports", "cricket"],
    weight: 10,
  },
  "football-soccer": {
    primary: [
      "football",
      "soccer",
      "fifa",
      "world cup",
      "premier league",
      "uefa",
    ],
    secondary: ["la liga", "messi", "ronaldo", "champions league", "transfer"],
    categories: ["sports"],
    weight: 9,
  },
  "sports-esports": {
    primary: ["esports", "gaming tournament", "competitive gaming"],
    secondary: ["esport championship", "gaming league"],
    categories: ["sports", "esports", "gaming"],
    weight: 8,
  },
  "sports-news": {
    primary: ["sports news", "sports update", "match", "game result"],
    secondary: ["championship", "tournament", "league", "sports"],
    categories: ["sports"],
    weight: 6,
  },

  // Format Tags
  "tutorial-guide": {
    primary: [
      "tutorial",
      "guide",
      "how to",
      "step by step",
      "learn",
      "beginners guide",
    ],
    secondary: ["tips", "tricks", "explained", "complete guide", "walkthrough"],
    categories: [],
    weight: 8,
  },
  "news-update": {
    primary: [
      "news",
      "update",
      "breaking",
      "latest",
      "announced",
      "announcement",
    ],
    secondary: ["breaking news", "just in", "update", "reveals"],
    categories: [],
    weight: 5,
  },
  "opinion-analysis": {
    primary: [
      "opinion",
      "analysis",
      "review",
      "editorial",
      "perspective",
      "commentary",
    ],
    secondary: ["thought", "view", "insight", "critique", "assessment"],
    categories: [],
    weight: 7,
  },
};

// Advanced text processing functions
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

function calculateTagScore(text, categoryIds, tagSlug, rule) {
  let score = 0;
  const normalizedText = normalizeText(text);
  const words = normalizedText.split(" ");

  // Primary keyword matching (higher weight)
  for (const keyword of rule.primary) {
    const normalizedKeyword = normalizeText(keyword);

    // Exact phrase match
    if (normalizedText.includes(normalizedKeyword)) {
      score += rule.weight * 2;
    }

    // Individual word matches
    const keywordWords = normalizedKeyword.split(" ");
    const matchedWords = keywordWords.filter((kw) => words.includes(kw));
    if (matchedWords.length > 0) {
      score += (matchedWords.length / keywordWords.length) * rule.weight;
    }
  }

  // Secondary keyword matching (lower weight)
  for (const keyword of rule.secondary) {
    const normalizedKeyword = normalizeText(keyword);

    if (normalizedText.includes(normalizedKeyword)) {
      score += rule.weight * 0.5;
    }
  }

  // Category bonus
  if (rule.categories.length > 0) {
    const categoryMatch = rule.categories.some((cat) =>
      categoryIds.includes(cat)
    );
    if (categoryMatch) {
      score += rule.weight * 1.5;
    }
  }

  return score;
}

async function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const options = {
      hostname: new URL(HYGRAPH_ENDPOINT).hostname,
      path: new URL(HYGRAPH_ENDPOINT).pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HYGRAPH_TOKEN}`,
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const response = JSON.parse(body);
        if (response.errors) {
          reject(new Error(JSON.stringify(response.errors, null, 2)));
        } else {
          resolve(response.data);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function getAllTags() {
  const query = `
    query GetAllTags {
      tags {
        id
        slug
        name
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.tags;
}

async function getAllPosts() {
  const query = `
    query GetAllPosts {
      posts(first: 1000) {
        id
        title
        slug
        excerpt
        categories {
          slug
        }
        tags {
          id
          slug
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.posts;
}

async function updatePostTags(postId, tagIds) {
  const mutation = `
    mutation UpdatePostTags($id: ID!, $tags: [TagWhereUniqueInput!]!) {
      updatePost(
        where: { id: $id }
        data: { tags: { set: $tags } }
      ) {
        id
        slug
        tags {
          slug
        }
      }
    }
  `;

  const tagsInput = tagIds.map((id) => ({ id }));
  return await graphqlRequest(mutation, { id: postId, tags: tagsInput });
}

async function publishPost(postId) {
  const mutation = `
    mutation PublishPost($id: ID!) {
      publishPost(where: { id: $id }) {
        id
      }
    }
  `;

  return await graphqlRequest(mutation, { id: postId });
}

function suggestTagsIntelligently(post, allTags) {
  const text = `${post.title} ${post.excerpt}`;
  const categoryIds = post.categories.map((c) => c.slug);
  const currentTagSlugs = post.tags.map((t) => t.slug);

  // Calculate scores for all tags
  const tagScores = [];

  for (const [slug, rule] of Object.entries(TAG_RULES)) {
    // Skip if already has this tag
    if (currentTagSlugs.includes(slug)) continue;

    const tag = allTags.find((t) => t.slug === slug);
    if (!tag) continue;

    const score = calculateTagScore(text, categoryIds, slug, rule);

    if (score > 0) {
      tagScores.push({ tag, score });
    }
  }

  // Sort by score (highest first) and take top tags
  tagScores.sort((a, b) => b.score - a.score);

  // Smart tag selection based on score thresholds
  const selectedTags = [];
  const MIN_SCORE = 5; // Minimum score threshold
  const MAX_TAGS = 5;
  const currentTagCount = post.tags.length;
  const maxNewTags = MAX_TAGS - currentTagCount;

  for (const { tag, score } of tagScores) {
    if (score >= MIN_SCORE && selectedTags.length < maxNewTags) {
      selectedTags.push({ tag, score });
    }
  }

  return selectedTags;
}

async function main() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "         🤖 INTELLIGENT AUTO-TAGGING SYSTEM v2.0                      "
  );
  console.log(
    "=======================================================================\n"
  );
  console.log("✨ Features:");
  console.log("  • Weighted keyword scoring");
  console.log("  • Primary & secondary keyword analysis");
  console.log("  • Category-based relevance boost");
  console.log("  • Smart score thresholds");
  console.log("  • Top 5 most relevant tags per post\n");

  try {
    console.log("🔍 Fetching all tags...");
    const allTags = await getAllTags();
    console.log(`✅ Found ${allTags.length} tags\n`);

    console.log("📚 Fetching all posts...");
    const posts = await getAllPosts();
    console.log(`✅ Found ${posts.length} posts\n`);

    console.log("🤖 Analyzing posts with intelligent scoring...\n");

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const post of posts) {
      const suggestedTags = suggestTagsIntelligently(post, allTags);

      if (suggestedTags.length === 0) {
        console.log(`⏭️  ${post.title.substring(0, 60)}...`);
        console.log(
          `   Current: ${post.tags.length} tags | No high-confidence matches\n`
        );
        skipped++;
        continue;
      }

      try {
        console.log(`📝 ${post.title.substring(0, 70)}`);
        console.log(
          `   Current tags: ${
            post.tags.map((t) => t.slug).join(", ") || "none"
          }`
        );
        console.log(`   Suggested tags with scores:`);

        suggestedTags.forEach(({ tag, score }) => {
          console.log(`     • ${tag.name} (score: ${score.toFixed(1)})`);
        });

        // Combine existing and new tags
        const allTagIds = [
          ...post.tags.map((t) => t.id),
          ...suggestedTags.map(({ tag }) => tag.id),
        ];

        const result = await updatePostTags(post.id, allTagIds);
        console.log(
          `   ✅ Updated: ${post.tags.length} → ${result.updatePost.tags.length} tags`
        );

        console.log(`   📤 Publishing...`);
        await publishPost(post.id);
        console.log(`   ✅ Published\n`);

        updated++;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
      }
    }

    console.log(
      "\n======================================================================="
    );
    console.log(
      "           ✅ INTELLIGENT AUTO-TAGGING COMPLETE                       "
    );
    console.log(
      "=======================================================================\n"
    );
    console.log("📊 Summary:");
    console.log(`  • Posts analyzed: ${posts.length}`);
    console.log(`  • Posts updated: ${updated}`);
    console.log(`  • Posts skipped: ${skipped} (no high-confidence matches)`);
    console.log(`  • Errors: ${errors}\n`);

    if (updated > 0) {
      console.log("🎉 Posts have been intelligently tagged!\n");
      console.log("💡 Next steps:");
      console.log("  1. Review tagged posts in Hygraph CMS");
      console.log(
        "  2. Adjust confidence thresholds if needed (MIN_SCORE in script)"
      );
      console.log("  3. Add more specific keywords for better accuracy");
      console.log("  4. Re-run for remaining posts\n");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

main();
