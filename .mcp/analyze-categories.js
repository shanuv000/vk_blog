#!/usr/bin/env node

/**
 * Category Consolidation & Cleanup Script
 * Analyzes current categories and helps consolidate them
 */

import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

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

async function analyzeCategories() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "           📊 CATEGORY ANALYSIS & CONSOLIDATION PLAN                  "
  );
  console.log(
    "=======================================================================\n"
  );

  const GET_ALL_POSTS = `
    query GetAllPosts {
      posts {
        id
        title
        slug
        categories {
          id
          name
          slug
        }
      }
    }
  `;

  const GET_ALL_CATEGORIES = `
    query GetAllCategories {
      categories {
        id
        name
        slug
      }
    }
  `;

  try {
    // Fetch all categories and posts
    const [categoriesData, postsData] = await Promise.all([
      graphqlRequest(GET_ALL_CATEGORIES),
      graphqlRequest(GET_ALL_POSTS),
    ]);

    const categories = categoriesData.categories;
    const posts = postsData.posts;

    // Calculate posts per category
    const categoryStats = categories.map((category) => {
      const categoryPosts = posts.filter((post) =>
        post.categories.some((cat) => cat.id === category.id)
      );

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        postCount: categoryPosts.length,
        posts: categoryPosts,
      };
    });

    // Sort by post count (descending)
    const sorted = categoryStats.sort((a, b) => b.postCount - a.postCount);

    console.log(
      `📊 Current State: ${categories.length} categories, ${posts.length} total posts\n`
    );

    console.log("📋 Category Distribution:\n");
    console.log("┌─────────────────────────────┬───────────┬──────────┐");
    console.log("│ Category Name               │ Slug      │ Posts    │");
    console.log("├─────────────────────────────┼───────────┼──────────┤");

    sorted.forEach((cat) => {
      const name = cat.name.padEnd(27);
      const slug = cat.slug.padEnd(9);
      const count = cat.postCount.toString().padStart(6);
      console.log(`│ ${name} │ ${slug} │ ${count}   │`);
    });
    console.log("└─────────────────────────────┴───────────┴──────────┘\n");

    // Analysis
    const totalPosts = sorted.reduce((sum, cat) => sum + cat.postCount, 0);
    const avgPosts = Math.round(totalPosts / categories.length);
    const overloaded = sorted.filter((cat) => cat.postCount > avgPosts * 2);
    const underutilized = sorted.filter((cat) => cat.postCount < 5);

    console.log("📈 Statistics:");
    console.log(`  • Total Posts: ${totalPosts}`);
    console.log(`  • Average per Category: ${avgPosts}`);
    console.log(`  • Overloaded (>2x avg): ${overloaded.length}`);
    console.log(`  • Underutilized (<5 posts): ${underutilized.length}\n`);

    if (overloaded.length > 0) {
      console.log("⚠️  Overloaded Categories (Need Splitting):\n");
      overloaded.forEach((cat) => {
        console.log(
          `  • ${cat.name}: ${cat.postCount} posts (${Math.round(
            (cat.postCount / totalPosts) * 100
          )}%)`
        );
      });
      console.log("");
    }

    if (underutilized.length > 0) {
      console.log("⚠️  Underutilized Categories (Consider Merging):\n");
      underutilized.forEach((cat) => {
        console.log(`  • ${cat.name}: ${cat.postCount} posts`);
      });
      console.log("");
    }

    // Recommended structure
    console.log(
      "======================================================================="
    );
    console.log(
      "           💡 RECOMMENDED CATEGORY STRUCTURE                          "
    );
    console.log(
      "=======================================================================\n"
    );

    console.log("🎯 Target: 8-10 Main Categories\n");

    const recommendations = {
      Technology: {
        keep: ["Technology"],
        merge: ["Science"],
        subcategories: ["AI & ML", "Web Development", "Gadgets", "Software"],
      },
      Gaming: {
        keep: ["Gaming"],
        merge: ["Esports"],
        subcategories: [
          "Esports",
          "Game Reviews",
          "Mobile Gaming",
          "PC Gaming",
        ],
      },
      Entertainment: {
        keep: ["Entertainment"],
        split: ["Movies", "TV Shows", "Music", "Celebrity News"],
        note: "Currently 49 posts - needs splitting",
      },
      Sports: {
        keep: ["Sports"],
        merge: ["Cricket"],
        subcategories: ["Cricket", "Football", "Other Sports"],
      },
      "Business & Finance": {
        keep: ["Business"],
        merge: ["Politics", "Education"],
        note: "Consolidate related professional topics",
      },
      Lifestyle: {
        create: true,
        merge: ["Fashion", "Health", "Travel"],
        note: "New category for personal interest content",
      },
    };

    Object.entries(recommendations).forEach(([name, config]) => {
      console.log(`📁 ${name}`);
      if (config.keep) console.log(`   Keep: ${config.keep.join(", ")}`);
      if (config.merge) console.log(`   Merge: ${config.merge.join(", ")}`);
      if (config.split)
        console.log(`   Split into: ${config.split.join(", ")}`);
      if (config.subcategories)
        console.log(`   Subcategories: ${config.subcategories.join(", ")}`);
      if (config.note) console.log(`   Note: ${config.note}`);
      console.log("");
    });

    console.log(
      "======================================================================="
    );
    console.log(
      "           🛠️  MIGRATION PLAN                                         "
    );
    console.log(
      "=======================================================================\n"
    );

    console.log("Step 1: Create New Categories (if needed)");
    console.log("  - Movies (split from Entertainment)");
    console.log("  - TV Shows (split from Entertainment)");
    console.log("  - Music (split from Entertainment)");
    console.log("  - Celebrity News (split from Entertainment)\n");

    console.log("Step 2: Migrate Posts");
    console.log(
      "  - Entertainment → Movies/TV/Music/Celebrity (based on content)"
    );
    console.log("  - Science → Technology");
    console.log("  - Esports → Gaming");
    console.log("  - Cricket → Sports");
    console.log("  - Politics/Education → Business\n");

    console.log("Step 3: Clean Up");
    console.log("  - Archive old categories (set show: false)");
    console.log("  - Update navigation menus");
    console.log("  - Test all category pages\n");

    console.log("💡 Next Steps:");
    console.log("  1. Review this analysis");
    console.log("  2. Decide on final category structure");
    console.log("  3. Run migration script to move posts");
    console.log("  4. Test and deploy changes\n");

    console.log(
      "=======================================================================\n"
    );

    return sorted;
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await analyzeCategories();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
