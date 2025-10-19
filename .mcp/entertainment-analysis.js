#!/usr/bin/env node

/**
 * Entertainment Category Analysis & Migration Planning
 * Analyzes 49 Entertainment posts and suggests subcategories
 */

import https from "https";
import fs from "fs";

const HYGRAPH_CDN_API = "ap-south-1.cdn.hygraph.com";
const HYGRAPH_CONTENT_API = "api-ap-south-1.hygraph.com";
const PROJECT_ID = "cky5wgpym15ym01z44tk90zeb";
const AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Keywords for classification
const CLASSIFICATION_RULES = {
  movies: {
    keywords: [
      "movie",
      "film",
      "batman",
      "spiderman",
      "thor",
      "aquaman",
      "morbius",
      "brahmastra",
      "gehraiyaan",
      "radhe shyam",
      "maaran",
      "pathan",
      "rudra",
      "cinema",
      "actor",
      "actress",
      "director",
    ],
    subcategory: "Movies",
  },
  tvShows: {
    keywords: [
      "bigg boss",
      "naagin",
      "show",
      "season",
      "episode",
      "lock upp",
      "tejasswi",
      "karan kundrra",
      "contestant",
      "host",
      "winner",
      "tv",
    ],
    subcategory: "TV Shows",
  },
  music: {
    keywords: [
      "song",
      "singer",
      "lata mangeshkar",
      "rula deti hai",
      "music",
      "album",
      "track",
      "teaser",
    ],
    subcategory: "Music",
  },
  celebrity: {
    keywords: [
      "shah rukh",
      "salman",
      "deepika",
      "kangana",
      "alia bhatt",
      "ranbir",
      "marriage",
      "wedding",
      "dating",
      "relationship",
      "birthday",
      "joe rogan",
      "donald trump",
      "chiranjeevi",
      "gauri khan",
      "aryan",
      "suhana",
    ],
    subcategory: "Celebrity News",
  },
};

function classifyPost(post) {
  const searchText = `${post.title} ${post.excerpt}`.toLowerCase();
  const scores = {};

  for (const [type, config] of Object.entries(CLASSIFICATION_RULES)) {
    scores[type] = 0;
    for (const keyword of config.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        scores[type]++;
      }
    }
  }

  // Get highest scoring category
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return "Celebrity News"; // Default fallback

  for (const [type, score] of Object.entries(scores)) {
    if (score === maxScore) {
      return CLASSIFICATION_RULES[type].subcategory;
    }
  }

  return "Celebrity News";
}

async function fetchEntertainmentPosts() {
  const query = `
    query {
      posts(where: { categories_some: { name: "Entertainment" } }, first: 100) {
        id
        title
        slug
        excerpt
        categories {
          id
          name
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: HYGRAPH_CDN_API,
      path: `/content/${PROJECT_ID}/master`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.errors) {
            reject(new Error(JSON.stringify(result.errors)));
          } else {
            resolve(result.data.posts);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

async function analyzeEntertainment() {
  console.log("\n" + "=".repeat(100));
  console.log("🎬 ENTERTAINMENT CATEGORY DEEP ANALYSIS");
  console.log("=".repeat(100));

  try {
    const posts = await fetchEntertainmentPosts();

    console.log(`\n📊 Total Entertainment Posts: ${posts.length}`);

    // Classify all posts
    const classification = {
      Movies: [],
      "TV Shows": [],
      Music: [],
      "Celebrity News": [],
    };

    for (const post of posts) {
      const category = classifyPost(post);
      classification[category].push(post);
    }

    console.log("\n📂 Suggested Distribution:");
    console.log("-".repeat(100));

    for (const [category, categoryPosts] of Object.entries(classification)) {
      const pct = ((categoryPosts.length / posts.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.max(1, Math.floor(categoryPosts.length / 2)));
      console.log(
        `  ${category.padEnd(20)} ${categoryPosts.length
          .toString()
          .padStart(2)} posts (${pct.padStart(5)}%) ${bar}`
      );
    }

    // Create migration plan
    const migrationPlan = {
      totalPosts: posts.length,
      timestamp: new Date().toISOString(),
      subcategories: {},
      posts: [],
    };

    for (const [category, categoryPosts] of Object.entries(classification)) {
      migrationPlan.subcategories[category] = categoryPosts.length;

      for (const post of categoryPosts) {
        migrationPlan.posts.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          currentCategories: post.categories.map((c) => c.name),
          suggestedCategory: category,
        });
      }
    }

    // Save detailed report
    const reportPath = "/tmp/entertainment_migration_plan.json";
    fs.writeFileSync(reportPath, JSON.stringify(migrationPlan, null, 2));
    console.log(`\n✅ Detailed migration plan saved to: ${reportPath}`);

    console.log("\n📋 Sample Posts per Category:");
    console.log("-".repeat(100));

    for (const [category, categoryPosts] of Object.entries(classification)) {
      console.log(`\n${category} (${categoryPosts.length} posts):`);
      const samples = categoryPosts.slice(0, 3);
      for (const post of samples) {
        console.log(
          `  • ${post.title.slice(0, 80)}${post.title.length > 80 ? "..." : ""}`
        );
      }
      if (categoryPosts.length > 3) {
        console.log(`  ... and ${categoryPosts.length - 3} more`);
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("✅ ANALYSIS COMPLETE");
    console.log("=".repeat(100));

    console.log("\n📝 Next Steps:");
    console.log(
      "  1. Review the migration plan in /tmp/entertainment_migration_plan.json"
    );
    console.log(
      "  2. Run create-subcategories.js to create new categories in Hygraph"
    );
    console.log("  3. Run migrate-entertainment.js to reassign posts");
    console.log("  4. Update frontend to display new categories");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run analysis
analyzeEntertainment();
