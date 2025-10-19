#!/usr/bin/env node

/**
 * Create Entertainment Subcategories in Hygraph
 * Creates: Movies, TV Shows, Music, Celebrity News
 */

import https from "https";
import "dotenv/config";

const HYGRAPH_CONTENT_API = "api-ap-south-1.hygraph.com";
const PROJECT_ID = "cky5wgpym15ym01z44tk90zeb";
const AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("❌ HYGRAPH_AUTH_TOKEN not found in environment variables");
  process.exit(1);
}

const NEW_CATEGORIES = [
  {
    name: "Movies",
    slug: "movies",
    description:
      "Movie reviews, trailers, box office news, and Hollywood/Bollywood updates",
    show: true,
  },
  {
    name: "TV Shows",
    slug: "tv-shows",
    description:
      "Television series, reality shows, streaming content, and TV industry news",
    show: true,
  },
  {
    name: "Music",
    slug: "music",
    description:
      "Music releases, artist news, concerts, and music industry updates",
    show: true,
  },
  {
    name: "Celebrity News",
    slug: "celebrity-news",
    description:
      "Celebrity gossip, interviews, relationships, and lifestyle news",
    show: true,
  },
];

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

async function checkExistingCategories() {
  const query = `
    query {
      categories(where: { name_in: ["Movies", "TV Shows", "Music", "Celebrity News"] }) {
        id
        name
        slug
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.categories;
}

async function createCategory(category) {
  const mutation = `
    mutation CreateCategory($name: String!, $slug: String!, $show: Boolean!) {
      createCategory(data: {
        name: $name
        slug: $slug
        show: $show
      }) {
        id
        name
        slug
        show
      }
    }
  `;

  return await graphqlRequest(mutation, {
    name: category.name,
    slug: category.slug,
    show: category.show,
  });
}

async function publishCategory(categoryId) {
  const mutation = `
    mutation PublishCategory($id: ID!) {
      publishCategory(where: { id: $id }, to: PUBLISHED) {
        id
        name
        stage
      }
    }
  `;

  return await graphqlRequest(mutation, { id: categoryId });
}

async function main() {
  console.log("\n" + "=".repeat(100));
  console.log("🎬 CREATING ENTERTAINMENT SUBCATEGORIES");
  console.log("=".repeat(100));

  try {
    // Check for existing categories
    console.log("\n🔍 Checking for existing categories...");
    const existing = await checkExistingCategories();

    if (existing.length > 0) {
      console.log(`\n⚠️  Found ${existing.length} existing categories:`);
      for (const cat of existing) {
        console.log(`  • ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
      }

      console.log(
        "\n❓ These categories already exist. Continue anyway? (will skip duplicates)"
      );
    }

    const existingNames = existing.map((c) => c.name);
    const categoriesToCreate = NEW_CATEGORIES.filter(
      (c) => !existingNames.includes(c.name)
    );

    if (categoriesToCreate.length === 0) {
      console.log("\n✅ All subcategories already exist. No action needed.");
      return;
    }

    console.log(`\n📝 Creating ${categoriesToCreate.length} new categories...`);

    const created = [];

    for (const category of categoriesToCreate) {
      try {
        console.log(`\n  Creating: ${category.name}...`);
        const result = await createCategory(category);
        console.log(
          `  ✅ Created: ${result.createCategory.name} (ID: ${result.createCategory.id})`
        );

        console.log(`  📤 Publishing: ${category.name}...`);
        await publishCategory(result.createCategory.id);
        console.log(`  ✅ Published: ${category.name}`);

        created.push(result.createCategory);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ Failed to create ${category.name}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("✅ CATEGORY CREATION COMPLETE");
    console.log("=".repeat(100));

    console.log(`\n📊 Summary:`);
    console.log(`  • Already existed: ${existing.length}`);
    console.log(`  • Newly created: ${created.length}`);
    console.log(`  • Total categories: ${existing.length + created.length}`);

    if (created.length > 0) {
      console.log("\n🎯 New Categories:");
      for (const cat of created) {
        console.log(`  • ${cat.name} - /${cat.slug}`);
      }
    }

    console.log("\n📝 Next Steps:");
    console.log("  1. Run migrate-entertainment.js to reassign posts");
    console.log("  2. Update frontend navigation to show new categories");
    console.log(
      '  3. Consider hiding or deleting the original "Entertainment" category'
    );
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
}

main();
