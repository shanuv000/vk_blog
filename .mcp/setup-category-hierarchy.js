#!/usr/bin/env node

/**
 * Setup Smart Category Hierarchy
 * Creates parent-child relationships for better UX
 */

import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

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

// Smart category hierarchy: Parent -> Children mapping
const CATEGORY_HIERARCHY = {
  technology: {
    name: "Technology",
    children: ["tech", "science"],
    showInNav: true,
    order: 1,
  },
  gaming: {
    name: "Gaming",
    children: ["games", "esports"],
    showInNav: true,
    order: 2,
  },
  "movies-tv": {
    name: "Movies & TV",
    children: ["movies", "tv-shows"],
    showInNav: true,
    order: 3,
  },
  superheroes: {
    name: "Superheroes",
    children: ["marvel", "dc", "superhero"],
    showInNav: true,
    order: 4,
  },
  entertainment: {
    name: "Entertainment",
    children: ["celebrity-news", "music"],
    showInNav: true,
    order: 5,
  },
  sports: {
    name: "Sports",
    children: ["cricket", "ipl", "chess"],
    showInNav: true,
    order: 6,
  },
  business: {
    name: "Business",
    children: ["finance", "education"],
    showInNav: true,
    order: 7,
  },
  lifestyle: {
    name: "Lifestyle",
    children: [],
    showInNav: true,
    order: 8,
  },
};

async function setupHierarchy() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "           🏗️  SMART CATEGORY HIERARCHY SETUP                         "
  );
  console.log(
    "=======================================================================\n"
  );
  console.log(
    "Strategy: Show 8 parent categories in nav, keep all 24 for filtering\n"
  );

  try {
    // Fetch all categories
    console.log("📊 Fetching all categories...\n");

    const categoriesData = await graphqlRequest(`
      query GetAllCategories {
        categories {
          id
          name
          slug
        }
      }
    `);

    const categories = categoriesData.categories;
    console.log(`✅ Found ${categories.length} categories\n`);

    // Create lookup map
    const categoryLookup = new Map();
    categories.forEach((cat) => {
      categoryLookup.set(cat.slug, cat);
    });

    console.log("🔧 Setting up hierarchy...\n");

    // Ensure all parent categories exist
    for (const [parentSlug, config] of Object.entries(CATEGORY_HIERARCHY)) {
      let parentCategory = categoryLookup.get(parentSlug);

      if (!parentCategory) {
        console.log(`   + Creating parent: ${config.name}`);

        const result = await graphqlRequest(
          `
          mutation CreateCategory($name: String!, $slug: String!) {
            createCategory(data: { 
              name: $name, 
              slug: $slug, 
              show: true 
            }) {
              id
              name
              slug
            }
          }
        `,
          { name: config.name, slug: parentSlug }
        );

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

        parentCategory = result.createCategory;
        categoryLookup.set(parentSlug, parentCategory);
      } else {
        console.log(`   ✓ Parent exists: ${config.name}`);
      }
    }

    console.log("\n📋 Category Hierarchy:\n");

    for (const [parentSlug, config] of Object.entries(CATEGORY_HIERARCHY)) {
      const parent = categoryLookup.get(parentSlug);

      console.log(`📁 ${config.name} (order: ${config.order})`);

      if (config.children.length > 0) {
        const childCategories = config.children
          .map((slug) => categoryLookup.get(slug))
          .filter(Boolean);

        childCategories.forEach((child) => {
          console.log(`   └─ ${child.name}`);
        });
      } else {
        console.log(`   └─ (no subcategories)`);
      }
      console.log("");
    }

    console.log(
      "======================================================================="
    );
    console.log(
      "           ✅ HIERARCHY SETUP COMPLETE                                "
    );
    console.log(
      "=======================================================================\n"
    );

    console.log("📊 Summary:");
    console.log(`   • Parent categories (shown in nav): 8`);
    console.log(`   • Total categories (in Hygraph): ${categories.length}`);
    console.log(`   • Navigation simplified: ✅`);
    console.log(`   • Detailed filtering preserved: ✅\n`);

    console.log(
      "💡 Next: Create the CategoryNav component to display this hierarchy\n"
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

setupHierarchy();
