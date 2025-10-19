#!/usr/bin/env node

/**
 * Migrate Entertainment Posts to Subcategories
 * Reads migration plan and updates posts in Hygraph
 */

import https from "https";
import fs from "fs";
import "dotenv/config";

const HYGRAPH_CONTENT_API = "api-ap-south-1.hygraph.com";
const PROJECT_ID = "cky5wgpym15ym01z44tk90zeb";
const AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

const DRY_RUN = process.argv.includes("--dry-run");

if (!AUTH_TOKEN) {
  console.error("❌ HYGRAPH_AUTH_TOKEN not found in environment variables");
  process.exit(1);
}

async function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query, variables });

    const options = {
      hostname: HYGRAPH_CONTENT_API,
      path: `/v2/${PROJECT_ID}/master`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Length": Buffer.byteLength(payload),
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
            reject(new Error(JSON.stringify(result.errors, null, 2)));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function getCategoryIds() {
  const query = `
    query {
      categories(where: { name_in: ["Movies", "TV Shows", "Music", "Celebrity News", "Entertainment"] }) {
        id
        name
        slug
      }
    }
  `;

  const data = await graphqlRequest(query);
  const categoryMap = {};
  for (const cat of data.categories) {
    categoryMap[cat.name] = cat.id;
  }
  return categoryMap;
}

async function updatePostCategories(
  postId,
  categoryIds,
  removeEntertainment = true
) {
  const mutation = `
    mutation UpdatePost($id: ID!, $categoryIds: [CategoryWhereUniqueInput!]!) {
      updatePost(
        where: { id: $id }
        data: { 
          categories: { set: $categoryIds }
        }
      ) {
        id
        title
        categories {
          id
          name
        }
      }
    }
  `;

  // Convert IDs to WhereUniqueInput format
  const categoryWhereInputs = categoryIds.map((id) => ({ id }));
  return await graphqlRequest(mutation, {
    id: postId,
    categoryIds: categoryWhereInputs,
  });
}

async function publishPost(postId) {
  const mutation = `
    mutation PublishPost($id: ID!) {
      publishPost(where: { id: $id }, to: PUBLISHED) {
        id
        stage
      }
    }
  `;

  return await graphqlRequest(mutation, { id: postId });
}

async function main() {
  console.log("\n" + "=".repeat(100));
  console.log(`🎬 MIGRATING ENTERTAINMENT POSTS ${DRY_RUN ? "(DRY RUN)" : ""}`);
  console.log("=".repeat(100));

  try {
    // Load migration plan
    const planPath = "/tmp/entertainment_migration_plan.json";
    if (!fs.existsSync(planPath)) {
      throw new Error(
        "Migration plan not found. Run entertainment-analysis.js first."
      );
    }

    const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
    console.log(`\n📋 Loaded migration plan: ${plan.totalPosts} posts`);

    // Get category IDs
    console.log("\n🔍 Fetching category IDs...");
    const categoryMap = await getCategoryIds();

    console.log("✅ Found categories:");
    for (const [name, id] of Object.entries(categoryMap)) {
      console.log(`  • ${name}: ${id}`);
    }

    if (
      !categoryMap["Movies"] ||
      !categoryMap["TV Shows"] ||
      !categoryMap["Music"] ||
      !categoryMap["Celebrity News"]
    ) {
      throw new Error(
        "Missing required subcategories. Run create-subcategories.js first."
      );
    }

    // Group posts by target category
    const grouped = {};
    for (const post of plan.posts) {
      const target = post.suggestedCategory;
      if (!grouped[target]) grouped[target] = [];
      grouped[target].push(post);
    }

    console.log("\n📊 Migration Summary:");
    for (const [category, posts] of Object.entries(grouped)) {
      console.log(`  • ${category}: ${posts.length} posts`);
    }

    if (DRY_RUN) {
      console.log("\n🔍 DRY RUN - No changes will be made");
      console.log("\n📋 Sample migrations:");
      for (const [category, posts] of Object.entries(grouped)) {
        console.log(`\n${category}:`);
        const samples = posts.slice(0, 3);
        for (const post of samples) {
          console.log(`  • ${post.title.slice(0, 70)}...`);
          console.log(`    Current: [${post.currentCategories.join(", ")}]`);
          console.log(
            `    New: [${category}${
              post.currentCategories.filter((c) => c !== "Entertainment")
                .length > 0
                ? ", " +
                  post.currentCategories
                    .filter((c) => c !== "Entertainment")
                    .join(", ")
                : ""
            }]`
          );
        }
      }

      console.log("\n💡 Run without --dry-run to execute migration");
      return;
    }

    // Execute migration
    console.log("\n🚀 Starting migration...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const post of plan.posts) {
      try {
        const targetCategoryId = categoryMap[post.suggestedCategory];

        // Keep other categories, remove Entertainment, add new subcategory
        const otherCategoryIds = post.currentCategories
          .filter((name) => name !== "Entertainment")
          .map((name) => categoryMap[name])
          .filter((id) => id !== undefined);

        const newCategoryIds = [...otherCategoryIds, targetCategoryId];

        console.log(`📝 Migrating: ${post.title.slice(0, 60)}...`);
        console.log(`   From: [${post.currentCategories.join(", ")}]`);
        console.log(
          `   To: [${post.suggestedCategory}${
            otherCategoryIds.length > 0
              ? ", " +
                post.currentCategories
                  .filter((c) => c !== "Entertainment")
                  .join(", ")
              : ""
          }]`
        );

        await updatePostCategories(post.id, newCategoryIds);
        await publishPost(post.id);

        console.log(`   ✅ Updated & Published\n`);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("✅ MIGRATION COMPLETE");
    console.log("=".repeat(100));

    console.log(`\n📊 Results:`);
    console.log(`  • Successful: ${successCount}/${plan.totalPosts}`);
    console.log(`  • Errors: ${errorCount}`);

    if (successCount === plan.totalPosts) {
      console.log("\n🎉 All posts migrated successfully!");

      console.log("\n📝 Next Steps:");
      console.log("  1. Verify posts in Hygraph CMS");
      console.log("  2. Update frontend to display new categories");
      console.log('  3. Consider hiding the old "Entertainment" category');
      console.log("  4. Test category pages on your website");
    }
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
}

main();
