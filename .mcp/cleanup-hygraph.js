#!/usr/bin/env node

import https from "https";

const API_URL =
  "https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master";
const AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error("❌ HYGRAPH_AUTH_TOKEN not found in environment");
  process.exit(1);
}

// Category data from analysis
const categories = {
  ckyp8mjzc1b710d65svgvj0n2: {
    name: "Business",
    slug: "business",
    show: true,
    posts: 4,
  },
  ckyp8mzew1c840b613wa1ivt9: {
    name: "Tech",
    slug: "tech",
    show: true,
    posts: 8,
  },
  ckyp8nxd41b930d65kmxqq50c: {
    name: "Entertainment",
    slug: "entertainment",
    show: false,
    posts: 49,
  },
  ckyp8o6mg1c9t0b61vgb16w90: {
    name: "Games",
    slug: "games",
    show: false,
    posts: 22,
  },
  ckyp8ot001bag0d65bmpujyfj: {
    name: "Education",
    slug: "education",
    show: true,
    posts: 2,
  },
  ckyp9ss1k1cyg0b6180up365x: {
    name: "LifeStyle",
    slug: "lifestyle",
    show: false,
    posts: 8,
  },
  ckypx0g5c1rwt0b619hf7ye2p: {
    name: "Cricket",
    slug: "cricket",
    show: false,
    posts: 4,
  },
  ckypytb0w1s3i0d650y8x6sne: {
    name: "Sports",
    slug: "sports",
    show: true,
    posts: 6,
  },
  ckyq22i5s1w770b61rcpn0ixy: {
    name: "Science",
    slug: "science",
    show: false,
    posts: 5,
  },
  ckysyye9c3gqc0d65jx9iepm7: {
    name: "Esports",
    slug: "esports",
    show: false,
    posts: 20,
  },
  ckytnqyz43qr10d650u1eg4sw: {
    name: "Finance",
    slug: "finance",
    show: false,
    posts: 1,
  },
  ckz1r76401vnu0b15iw9e20p9: {
    name: "Marvel",
    slug: "marvel",
    show: true,
    posts: 17,
  },
  clw60tee60ewz07o3fc622r6z: {
    name: "AI & ML",
    slug: "ml",
    show: true,
    posts: 0,
  },
  clw663m21004i07o9waxbfjs2: {
    name: "Politics",
    slug: "politics",
    show: true,
    posts: 0,
  },
  clwa4olo70gw307pl7wbmj7j2: {
    name: "code",
    slug: "code",
    show: false,
    posts: 0,
  },
  clwelokgi1o1y07pijyt0haah: {
    name: "IPL",
    slug: "ipl",
    show: false,
    posts: 3,
  },
  clwelrbb11o7e07pif4174pt1: {
    name: "Chess",
    slug: "chess",
    show: false,
    posts: 1,
  },
  clwfzqx4n0blv0co5j8k8y47a: {
    name: "Automobile",
    slug: "automobile",
    show: false,
    posts: 0,
  },
  clwg0qtkc0cgd07pebge4nhto: {
    name: "Youtube",
    slug: "youtube",
    show: false,
    posts: 0,
  },
  clwg3s4560fdq07petmt7hyts: { name: "DC", slug: "dc", show: false, posts: 2 },
  clwg3t8es0f8u0co5v4zdmgrr: {
    name: "Superhero",
    slug: "superhero",
    show: false,
    posts: 12,
  },
  clwg3u3qn0f9y0co56t2e1p0q: {
    name: "Bike",
    slug: "bike",
    show: false,
    posts: 0,
  },
  clwgbmd59017a07ocf91je4ct: {
    name: "Youtube news",
    slug: "youtube-news",
    show: false,
    posts: 0,
  },
  clx1kym5v0kuv07o4wmy3yp7k: {
    name: "T20 World Cup 🏏",
    slug: "cricket-world-cup",
    show: false,
    posts: 0,
  },
  cmew9a81o3is407pmjoxkveh6: {
    name: "Bigg Boss",
    slug: "biggboss",
    show: true,
    posts: 0,
  },
};

function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Length": data.length,
      },
    };

    const req = https.request(API_URL, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.errors) {
            reject(new Error(JSON.stringify(result.errors, null, 2)));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function makeVisible(id, name) {
  console.log(`\n🔄 Making "${name}" visible...`);
  const mutation = `
    mutation UpdateCategory($id: ID!) {
      updateCategory(where: { id: $id }, data: { show: true }) {
        id
        name
        show
      }
    }
  `;

  try {
    const result = await graphqlRequest(mutation, { id });
    console.log(`✅ "${name}" is now visible`);

    // Publish the change
    const publishMutation = `
      mutation PublishCategory($id: ID!) {
        publishCategory(where: { id: $id }, to: PUBLISHED) {
          id
          name
        }
      }
    `;
    await graphqlRequest(publishMutation, { id });
    console.log(`📤 "${name}" published`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update "${name}":`, error.message);
    return false;
  }
}

async function deleteCategory(id, name) {
  console.log(`\n🗑️  Deleting "${name}"...`);
  const mutation = `
    mutation DeleteCategory($id: ID!) {
      deleteCategory(where: { id: $id }) {
        id
        name
      }
    }
  `;

  try {
    const result = await graphqlRequest(mutation, { id });
    console.log(`✅ "${name}" deleted`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete "${name}":`, error.message);
    return false;
  }
}

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🧹 HYGRAPH CMS CLEANUP - EXECUTION");
  console.log("=".repeat(80));

  // Categories to make visible (hidden but have posts)
  const toMakeVisible = [];
  const toDelete = [];
  const toKeep = [];

  for (const [id, cat] of Object.entries(categories)) {
    if (cat.posts > 0 && !cat.show) {
      toMakeVisible.push({ id, ...cat });
    } else if (cat.posts === 0) {
      toDelete.push({ id, ...cat });
    } else {
      toKeep.push({ id, ...cat });
    }
  }

  console.log("\n📋 CLEANUP PLAN:");
  console.log(`  ✅ Keep (visible with posts): ${toKeep.length}`);
  console.log(`  🔄 Make visible (hidden with posts): ${toMakeVisible.length}`);
  console.log(`  ❌ Delete (no posts): ${toDelete.length}`);

  console.log("\n" + "=".repeat(80));
  console.log("PHASE 1: MAKING HIDDEN CATEGORIES VISIBLE");
  console.log("=".repeat(80));

  let madeVisible = 0;
  for (const cat of toMakeVisible) {
    const success = await makeVisible(cat.id, cat.name);
    if (success) madeVisible++;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
  }

  console.log("\n" + "=".repeat(80));
  console.log("PHASE 2: DELETING UNUSED CATEGORIES");
  console.log("=".repeat(80));

  let deleted = 0;
  for (const cat of toDelete) {
    const success = await deleteCategory(cat.id, cat.name);
    if (success) deleted++;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
  }

  console.log("\n" + "=".repeat(80));
  console.log("✨ CLEANUP COMPLETE");
  console.log("=".repeat(80));
  console.log(`  ✅ Made visible: ${madeVisible}/${toMakeVisible.length}`);
  console.log(`  ❌ Deleted: ${deleted}/${toDelete.length}`);
  console.log(
    `  📊 Total categories after cleanup: ${toKeep.length + madeVisible}`
  );
  console.log("=".repeat(80) + "\n");
}

main().catch(console.error);
