import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Tag matching rules based on keywords in title, excerpt, and categories
const TAG_RULES = {
  // Technology Tags
  "ai-artificial-intelligence": {
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "chatgpt",
      "openai",
      "neural",
      "deep learning",
    ],
    categories: ["technology"],
  },
  "web3-blockchain": {
    keywords: [
      "web3",
      "blockchain",
      "crypto",
      "nft",
      "bitcoin",
      "ethereum",
      "defi",
      "metaverse",
    ],
    categories: ["technology"],
  },
  "gadgets-tech": {
    keywords: [
      "gadget",
      "device",
      "smartphone",
      "laptop",
      "tablet",
      "earbuds",
      "watch",
      "phone",
      "iphone",
      "samsung",
      "pixel",
    ],
    categories: ["technology"],
  },
  "science-innovation": {
    keywords: [
      "science",
      "innovation",
      "research",
      "discovery",
      "space",
      "nasa",
      "isro",
      "quantum",
    ],
    categories: ["technology", "science"],
  },
  cybersecurity: {
    keywords: [
      "cybersecurity",
      "security",
      "hack",
      "breach",
      "privacy",
      "encryption",
      "vulnerability",
      "malware",
    ],
    categories: ["technology"],
  },
  "cloud-computing": {
    keywords: ["cloud", "aws", "azure", "google cloud", "saas", "paas", "iaas"],
    categories: ["technology"],
  },
  "software-development": {
    keywords: [
      "developer",
      "programming",
      "coding",
      "software",
      "app development",
      "javascript",
      "python",
      "react",
      "next.js",
    ],
    categories: ["technology"],
  },
  "internet-culture": {
    keywords: ["meme", "viral", "trend", "social media", "internet", "online"],
    categories: ["technology", "entertainment"],
  },

  // Gaming Tags
  "esports-competitive": {
    keywords: [
      "esports",
      "competitive gaming",
      "tournament",
      "championship",
      "league",
      "valorant",
      "csgo",
      "dota",
    ],
    categories: ["gaming", "esports"],
  },
  "game-reviews": {
    keywords: ["game review", "gameplay", "worth playing", "rating"],
    categories: ["gaming"],
  },
  "streaming-twitch": {
    keywords: [
      "twitch",
      "streaming",
      "streamer",
      "live stream",
      "youtube gaming",
    ],
    categories: ["gaming"],
  },
  "mobile-gaming": {
    keywords: [
      "mobile game",
      "android game",
      "ios game",
      "bgmi",
      "pubg mobile",
      "free fire",
      "cod mobile",
    ],
    categories: ["gaming"],
  },
  "console-gaming": {
    keywords: [
      "playstation",
      "ps5",
      "ps4",
      "xbox",
      "nintendo",
      "switch",
      "console",
    ],
    categories: ["gaming"],
  },
  "pc-gaming": {
    keywords: [
      "pc gaming",
      "steam",
      "epic games",
      "gaming pc",
      "graphics card",
      "rtx",
      "nvidia",
    ],
    categories: ["gaming"],
  },
  "gaming-news": {
    keywords: [
      "game release",
      "game launch",
      "game update",
      "patch notes",
      "dlc",
    ],
    categories: ["gaming"],
  },

  // Entertainment Tags
  "mcu-marvel": {
    keywords: [
      "marvel",
      "mcu",
      "avengers",
      "spider-man",
      "iron man",
      "thor",
      "captain america",
      "deadpool",
      "x-men",
    ],
    categories: ["entertainment", "movies", "tv-shows"],
  },
  "dc-comics": {
    keywords: [
      "dc",
      "batman",
      "superman",
      "wonder woman",
      "justice league",
      "aquaman",
      "flash",
      "joker",
    ],
    categories: ["entertainment", "movies", "tv-shows"],
  },
  "bollywood-movies": {
    keywords: [
      "bollywood",
      "hindi movie",
      "hindi film",
      "srk",
      "salman khan",
      "aamir khan",
      "akshay kumar",
    ],
    categories: ["entertainment", "movies"],
  },
  "hollywood-movies": {
    keywords: ["hollywood", "movie", "film", "cinema", "box office"],
    categories: ["entertainment", "movies"],
  },
  "streaming-services": {
    keywords: [
      "netflix",
      "amazon prime",
      "disney+",
      "hotstar",
      "hbo",
      "apple tv+",
      "streaming",
    ],
    categories: ["entertainment"],
  },
  "tv-shows-series": {
    keywords: ["tv show", "series", "season", "episode", "web series"],
    categories: ["entertainment", "tv-shows"],
  },
  "music-artists": {
    keywords: [
      "music",
      "song",
      "album",
      "artist",
      "singer",
      "band",
      "concert",
      "spotify",
    ],
    categories: ["entertainment", "music"],
  },
  "celebrity-lifestyle": {
    keywords: [
      "celebrity",
      "actor",
      "actress",
      "star",
      "lifestyle",
      "red carpet",
      "awards",
    ],
    categories: ["entertainment", "celebrity-news"],
  },

  // Sports Tags
  "cricket-ipl": {
    keywords: [
      "cricket",
      "ipl",
      "world cup",
      "test match",
      "odi",
      "t20",
      "bcci",
      "virat kohli",
      "rohit sharma",
    ],
    categories: ["sports", "cricket"],
  },
  "football-soccer": {
    keywords: [
      "football",
      "soccer",
      "fifa",
      "world cup",
      "premier league",
      "la liga",
      "messi",
      "ronaldo",
    ],
    categories: ["sports"],
  },
  "sports-esports": {
    keywords: ["esports", "gaming tournament", "competitive"],
    categories: ["sports", "esports", "gaming"],
  },
  "sports-news": {
    keywords: ["sports news", "match", "game", "championship", "tournament"],
    categories: ["sports"],
  },

  // Format Tags
  "tutorial-guide": {
    keywords: [
      "tutorial",
      "guide",
      "how to",
      "step by step",
      "tips",
      "tricks",
      "learn",
    ],
    categories: [],
  },
  "news-update": {
    keywords: ["news", "update", "breaking", "latest", "announced"],
    categories: [],
  },
  "opinion-analysis": {
    keywords: [
      "opinion",
      "analysis",
      "review",
      "perspective",
      "editorial",
      "thought",
    ],
    categories: [],
  },
};

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

  // Convert tag IDs to WhereUniqueInput format
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

function suggestTags(post, allTags) {
  const suggestions = [];
  const text = `${post.title} ${post.excerpt}`.toLowerCase();
  const categoryIds = post.categories.map((c) => c.slug);

  for (const [slug, rule] of Object.entries(TAG_RULES)) {
    const tag = allTags.find((t) => t.slug === slug);
    if (!tag) continue;

    // Check if already has this tag
    if (post.tags.some((t) => t.slug === slug)) continue;

    // Check category match
    if (rule.categories.length > 0) {
      const categoryMatch = rule.categories.some((cat) =>
        categoryIds.includes(cat)
      );
      if (!categoryMatch) continue;
    }

    // Check keyword match
    const keywordMatch = rule.keywords.some((keyword) =>
      text.includes(keyword)
    );

    if (keywordMatch) {
      suggestions.push(tag);
    }
  }

  // Limit to 5 tags per post (3-5 is ideal)
  const currentTagCount = post.tags.length;
  const maxNewTags = Math.max(0, 5 - currentTagCount);

  return suggestions.slice(0, maxNewTags);
}

async function main() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "                🏷️  AUTO-TAGGING POSTS IN HYGRAPH                      "
  );
  console.log(
    "=======================================================================\n"
  );

  try {
    // Get all tags
    console.log("🔍 Fetching all tags...");
    const allTags = await getAllTags();
    console.log(`✅ Found ${allTags.length} tags\n`);

    // Get all posts
    console.log("📚 Fetching all posts...");
    const posts = await getAllPosts();
    console.log(`✅ Found ${posts.length} posts\n`);

    console.log("🤖 Analyzing posts and suggesting tags...\n");

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const post of posts) {
      const suggestedTags = suggestTags(post, allTags);

      if (suggestedTags.length === 0) {
        console.log(`⏭️  ${post.title}`);
        console.log(
          `   Already has ${post.tags.length} tags or no matches found\n`
        );
        skipped++;
        continue;
      }

      try {
        console.log(`📝 ${post.title}`);
        console.log(
          `   Current tags: ${
            post.tags.map((t) => t.slug).join(", ") || "none"
          }`
        );
        console.log(
          `   Suggested: ${suggestedTags.map((t) => t.name).join(", ")}`
        );

        // Combine existing and new tags
        const allTagIds = [
          ...post.tags.map((t) => t.id),
          ...suggestedTags.map((t) => t.id),
        ];

        const result = await updatePostTags(post.id, allTagIds);
        console.log(
          `   ✅ Updated with ${result.updatePost.tags.length} total tags`
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
      "                ✅ AUTO-TAGGING COMPLETE                               "
    );
    console.log(
      "=======================================================================\n"
    );
    console.log("📊 Summary:");
    console.log(`  • Posts updated: ${updated}`);
    console.log(`  • Posts skipped: ${skipped}`);
    console.log(`  • Errors: ${errors}\n`);

    if (updated > 0) {
      console.log("🎉 Posts have been tagged automatically!\n");
      console.log("💡 Next steps:");
      console.log("  1. Review tagged posts in Hygraph CMS");
      console.log("  2. Manually adjust tags if needed");
      console.log("  3. Add tags to remaining posts\n");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

main();
