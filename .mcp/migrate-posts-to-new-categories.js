#!/usr/bin/env node

/**
 * Migrate Posts to New Consolidated Categories
 * Fixes the category assignment after consolidation
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

// Migration mapping: old category slug -> new category slug
const MIGRATION_MAP = {
  tech: "technology",
  science: "technology",
  games: "gaming",
  esports: "gaming",
  movies: "movies-tv",
  "tv-shows": "movies-tv",
  marvel: "superheroes",
  dc: "superheroes",
  superhero: "superheroes",
  "celebrity-news": "entertainment",
  music: "entertainment",
  entertainment: "entertainment",
  sports: "sports",
  cricket: "sports",
  ipl: "sports",
  chess: "sports",
  business: "business",
  finance: "business",
  education: "business",
  lifestyle: "lifestyle",
};

async function migratePosts() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "           🔄 POST MIGRATION TO NEW CATEGORIES                        "
  );
  console.log(
    "=======================================================================\n"
  );

  try {
    // Fetch all posts and categories
    console.log("📊 Fetching posts and categories...\n");

    const [postsData, categoriesData] = await Promise.all([
      graphqlRequest(`
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
      `),
      graphqlRequest(`
        query GetAllCategories {
          categories {
            id
            name
            slug
          }
        }
      `),
    ]);

    const posts = postsData.posts;
    const categories = categoriesData.categories;

    console.log(
      `✅ Found ${posts.length} posts and ${categories.length} categories\n`
    );

    // Create category lookup by slug
    const categoryLookup = new Map();
    categories.forEach((cat) => {
      categoryLookup.set(cat.slug, cat.id);
    });

    // Migrate each post
    console.log("🔄 Migrating posts...\n");

    let migrated = 0;
    let errors = [];

    for (const post of posts) {
      try {
        // Determine new categories for this post
        const newCategoryIds = new Set();

        for (const oldCategory of post.categories) {
          const newSlug = MIGRATION_MAP[oldCategory.slug];
          if (newSlug && categoryLookup.has(newSlug)) {
            newCategoryIds.add(categoryLookup.get(newSlug));
          }
        }

        if (newCategoryIds.size === 0) {
          console.log(`   ⚠️  Skipping "${post.title}" - no mapping found`);
          continue;
        }

        // Convert to array of connect objects
        const categoryConnections = Array.from(newCategoryIds).map((id) => ({
          id,
        }));

        // Update post with new categories
        await graphqlRequest(
          `
          mutation UpdatePost($id: ID!, $categories: [CategoryWhereUniqueInput!]!) {
            updatePost(
              where: { id: $id }
              data: { categories: { set: $categories } }
            ) {
              id
              title
            }
          }
        `,
          { id: post.id, categories: categoryConnections }
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
          console.log(`   ✓ Migrated ${migrated}/${posts.length} posts...`);
        }
      } catch (error) {
        errors.push({ title: post.title, error: error.message });
        console.log(`   ❌ Error: ${post.title}`);
      }
    }

    console.log(
      `\n✅ Migration complete: ${migrated}/${posts.length} posts migrated\n`
    );

    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors encountered:\n`);
      errors
        .slice(0, 5)
        .forEach((e) =>
          console.log(`   - ${e.title}: ${e.error.substring(0, 100)}...`)
        );
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more`);
      }
      console.log("");
    }

    // Show final distribution
    console.log("📊 Final Distribution:\n");

    const newCategorySlugs = [...new Set(Object.values(MIGRATION_MAP))];
    const distribution = {};

    for (const slug of newCategorySlugs) {
      const catId = categoryLookup.get(slug);
      if (catId) {
        distribution[slug] = posts.filter((post) =>
          post.categories.some((c) => MIGRATION_MAP[c.slug] === slug)
        ).length;
      }
    }

    Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([slug, count]) => {
        const category = categories.find((c) => c.slug === slug);
        console.log(`   ${category?.name || slug}: ${count} posts`);
      });

    console.log(
      "\n======================================================================="
    );
    console.log("✅ Done! Your categories are now consolidated.\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

migratePosts();
