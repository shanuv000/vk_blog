#!/usr/bin/env node

/**
 * Category Consolidation Migration Script
 * Merges 20 categories into 8 well-balanced categories
 */

import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Color scheme for new categories
const CATEGORY_COLORS = {
  Technology: "#3B82F6", // Blue
  Gaming: "#8B5CF6", // Purple
  "Movies & TV": "#EF4444", // Red
  Entertainment: "#EC4899", // Pink
  Sports: "#10B981", // Green
  Business: "#F59E0B", // Amber
  Lifestyle: "#06B6D4", // Cyan
  Superheroes: "#DC2626", // Dark Red
};

async function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const url = new URL(HYGRAPH_ENDPOINT);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
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

// Migration mapping: old category slug -> new category name
const MIGRATION_MAP = {
  // Technology (merge Tech + Science)
  tech: "Technology",
  science: "Technology",

  // Gaming (merge Games + Esports)
  games: "Gaming",
  esports: "Gaming",

  // Movies & TV (merge Movies + TV Shows)
  movies: "Movies & TV",
  "tv-shows": "Movies & TV",

  // Superheroes (merge Marvel + DC + Superhero)
  marvel: "Superheroes",
  dc: "Superheroes",
  superhero: "Superheroes",

  // Entertainment (merge Celebrity News + Music + Entertainment)
  "celebrity-news": "Entertainment",
  music: "Entertainment",
  entertainment: "Entertainment",

  // Sports (merge Sports + Cricket + IPL + Chess)
  sports: "Sports",
  cricket: "Sports",
  ipl: "Sports",
  chess: "Sports",

  // Business (merge Business + Finance + Education)
  business: "Business",
  finance: "Business",
  education: "Business",

  // Lifestyle (keep as is)
  lifestyle: "Lifestyle",
};

async function consolidateCategories() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "           🔄 CATEGORY CONSOLIDATION MIGRATION                        "
  );
  console.log(
    "=======================================================================\n"
  );
  console.log("📋 Plan: 20 categories → 8 consolidated categories\n");

  try {
    // Step 1: Fetch all posts with their categories
    console.log("📊 Step 1: Fetching all posts and categories...\n");

    const postsData = await graphqlRequest(`
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
    `);

    const categoriesData = await graphqlRequest(`
      query GetAllCategories {
        categories {
          id
          name
          slug
        }
      }
    `);

    const posts = postsData.posts;
    const existingCategories = categoriesData.categories;

    console.log(
      `✅ Found ${posts.length} posts across ${existingCategories.length} categories\n`
    );

    // Step 2: Create new consolidated categories (or find existing ones)
    console.log("📁 Step 2: Setting up consolidated categories...\n");

    const newCategoryNames = [...new Set(Object.values(MIGRATION_MAP))];
    const categoryMap = new Map(); // new name -> category ID

    for (const categoryName of newCategoryNames) {
      const slug = categoryName
        .toLowerCase()
        .replace(/\s+&\s+/g, "-")
        .replace(/\s+/g, "-");

      // Check if category already exists
      const existing = existingCategories.find((c) => c.slug === slug);

      if (existing) {
        console.log(`   ✓ Using existing: ${categoryName}`);
        categoryMap.set(categoryName, existing.id);
      } else {
        // Create new category
        console.log(`   + Creating new: ${categoryName}`);
        const result = await graphqlRequest(
          `
          mutation CreateCategory($name: String!, $slug: String!) {
            createCategory(data: { name: $name, slug: $slug, show: true }) {
              id
              name
              slug
            }
          }
        `,
          { name: categoryName, slug }
        );

        // Publish the category
        await graphqlRequest(
          `
          mutation PublishCategory($id: ID!) {
            publishCategory(where: { id: $id }, to: PUBLISHED) {
              id
            }
          }
        `,
          { id: result.createCategory.id }
        );

        categoryMap.set(categoryName, result.createCategory.id);
      }
    }

    console.log(`\n✅ ${categoryMap.size} consolidated categories ready\n`);

    // Step 3: Migrate posts to new categories
    console.log("🔄 Step 3: Migrating posts to consolidated categories...\n");

    let migrated = 0;
    let skipped = 0;
    const errors = [];

    for (const post of posts) {
      try {
        // Determine new categories for this post
        const newCategoryIds = new Set();

        for (const oldCategory of post.categories) {
          const newCategoryName = MIGRATION_MAP[oldCategory.slug];
          if (newCategoryName) {
            const newCategoryId = categoryMap.get(newCategoryName);
            if (newCategoryId) {
              newCategoryIds.add(newCategoryId);
            }
          }
        }

        if (newCategoryIds.size === 0) {
          console.log(`   ⚠️  Skipping "${post.title}" - no mapping found`);
          skipped++;
          continue;
        }

        // Update post with new categories
        const categoryIdsArray = Array.from(newCategoryIds);

        await graphqlRequest(
          `
          mutation UpdatePost($id: ID!, $categoryIds: [ID!]!) {
            updatePost(
              where: { id: $id }
              data: { categories: { set: $categoryIds } }
            ) {
              id
            }
          }
        `,
          { id: post.id, categoryIds: categoryIdsArray }
        );

        // Publish the update
        await graphqlRequest(
          `
          mutation PublishPost($id: ID!) {
            publishPost(where: { id: $id }, to: PUBLISHED) {
              id
            }
          }
        `,
          { id: post.id }
        );

        migrated++;

        if (migrated % 10 === 0) {
          console.log(`   ✓ Migrated ${migrated} posts...`);
        }
      } catch (error) {
        errors.push({ post: post.title, error: error.message });
        console.log(`   ❌ Error migrating "${post.title}": ${error.message}`);
      }
    }

    console.log(
      `\n✅ Migration complete: ${migrated} posts migrated, ${skipped} skipped\n`
    );

    if (errors.length > 0) {
      console.log("⚠️  Errors encountered:");
      errors.forEach((e) => console.log(`   - ${e.post}: ${e.error}`));
      console.log("");
    }

    // Step 4: Show final distribution
    console.log("📊 Step 4: Final category distribution:\n");

    const finalStats = new Map();
    for (const [categoryName, categoryId] of categoryMap) {
      const count = posts.filter((post) =>
        post.categories.some((c) => MIGRATION_MAP[c.slug] === categoryName)
      ).length;
      finalStats.set(categoryName, count);
    }

    console.log("┌─────────────────────────────┬──────────┐");
    console.log("│ Category Name               │ Posts    │");
    console.log("├─────────────────────────────┼──────────┤");

    Array.from(finalStats.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        const namePadded = name.padEnd(27);
        const countPadded = count.toString().padStart(6);
        console.log(`│ ${namePadded} │ ${countPadded}   │`);
      });

    console.log("└─────────────────────────────┴──────────┘\n");

    // Step 5: Archive old categories
    console.log("🗄️  Step 5: Archiving old categories...\n");

    const oldCategorySlugs = Object.keys(MIGRATION_MAP);
    const newCategorySlugs = new Set(
      Array.from(categoryMap.keys()).map((name) =>
        name
          .toLowerCase()
          .replace(/\s+&\s+/g, "-")
          .replace(/\s+/g, "-")
      )
    );

    let archived = 0;
    for (const oldSlug of oldCategorySlugs) {
      // Don't archive if it's one of the new categories
      if (newCategorySlugs.has(oldSlug)) {
        continue;
      }

      const category = existingCategories.find((c) => c.slug === oldSlug);
      if (category) {
        try {
          // Hide the category
          await graphqlRequest(
            `
            mutation HideCategory($id: ID!) {
              updateCategory(
                where: { id: $id }
                data: { show: false }
              ) {
                id
              }
            }
          `,
            { id: category.id }
          );

          await graphqlRequest(
            `
            mutation PublishCategory($id: ID!) {
              publishCategory(where: { id: $id }, to: PUBLISHED) {
                id
              }
            }
          `,
            { id: category.id }
          );

          console.log(`   📦 Archived: ${category.name}`);
          archived++;
        } catch (error) {
          console.log(
            `   ⚠️  Could not archive ${category.name}: ${error.message}`
          );
        }
      }
    }

    console.log(`\n✅ Archived ${archived} old categories\n`);

    console.log(
      "======================================================================="
    );
    console.log(
      "           ✅ CONSOLIDATION COMPLETE!                                 "
    );
    console.log(
      "=======================================================================\n"
    );
    console.log("📈 Results:");
    console.log(`   • Categories: 20 → ${categoryMap.size}`);
    console.log(`   • Posts migrated: ${migrated}`);
    console.log(`   • Old categories archived: ${archived}`);
    console.log(`   • Errors: ${errors.length}\n`);
    console.log("💡 Next Steps:");
    console.log("   1. Check your website navigation");
    console.log("   2. Verify category pages load correctly");
    console.log("   3. Update any hardcoded category references");
    console.log("   4. Restart your dev server to see changes\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await consolidateCategories();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
