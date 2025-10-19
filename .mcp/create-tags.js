#!/usr/bin/env node

/**
 * Create 30 Tags in Hygraph
 * NOTE: Tag model must exist in Hygraph schema first!
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

// 30 Comprehensive Tags
const TAGS = [
  // Technology & Science (8 tags)
  {
    name: "AI & Artificial Intelligence",
    slug: "ai-artificial-intelligence",
    description: "AI, Machine Learning, ChatGPT, Neural Networks",
    color: "#3B82F6",
  },
  {
    name: "Web3 & Blockchain",
    slug: "web3-blockchain",
    description: "Cryptocurrency, NFTs, Blockchain Technology",
    color: "#8B5CF6",
  },
  {
    name: "Gadgets & Tech",
    slug: "gadgets-tech",
    description: "Phones, Laptops, Tech Reviews, Hardware",
    color: "#06B6D4",
  },
  {
    name: "Science & Innovation",
    slug: "science-innovation",
    description: "Scientific Discoveries, Research, Innovation",
    color: "#10B981",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Security, Privacy, Hacking, Data Protection",
    color: "#EF4444",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "AWS, Azure, Cloud Technology",
    color: "#F59E0B",
  },
  {
    name: "Software Development",
    slug: "software-development",
    description: "Coding, Programming, Development",
    color: "#6366F1",
  },
  {
    name: "Internet Culture",
    slug: "internet-culture",
    description: "Memes, Viral Content, Social Media",
    color: "#EC4899",
  },

  // Gaming & Esports (7 tags)
  {
    name: "Esports & Competitive Gaming",
    slug: "esports-competitive",
    description: "Tournaments, Pro Gaming, Esports Events",
    color: "#F43F5E",
  },
  {
    name: "Game Reviews",
    slug: "game-reviews",
    description: "Game Analysis, Reviews, Critiques",
    color: "#8B5CF6",
  },
  {
    name: "Streaming & Twitch",
    slug: "streaming-twitch",
    description: "Streamers, Twitch, YouTube Gaming",
    color: "#A855F7",
  },
  {
    name: "Mobile Gaming",
    slug: "mobile-gaming",
    description: "Mobile Games, Apps, iOS/Android",
    color: "#14B8A6",
  },
  {
    name: "Console Gaming",
    slug: "console-gaming",
    description: "PS5, Xbox, Nintendo Switch",
    color: "#3B82F6",
  },
  {
    name: "PC Gaming",
    slug: "pc-gaming",
    description: "PC Games, Steam, Epic Games",
    color: "#6366F1",
  },
  {
    name: "Gaming News",
    slug: "gaming-news",
    description: "Gaming Industry News, Releases",
    color: "#F59E0B",
  },

  // Entertainment (8 tags)
  {
    name: "MCU & Marvel",
    slug: "mcu-marvel",
    description: "Marvel Cinematic Universe, Comics",
    color: "#DC2626",
  },
  {
    name: "DC Comics Universe",
    slug: "dc-comics",
    description: "DC Universe, Batman, Superman",
    color: "#1E40AF",
  },
  {
    name: "Bollywood Movies",
    slug: "bollywood-movies",
    description: "Hindi Cinema, Indian Films",
    color: "#F59E0B",
  },
  {
    name: "Hollywood Movies",
    slug: "hollywood-movies",
    description: "English Cinema, Box Office",
    color: "#7C3AED",
  },
  {
    name: "Streaming Services",
    slug: "streaming-services",
    description: "Netflix, Disney+, Prime Video",
    color: "#EF4444",
  },
  {
    name: "TV Shows & Series",
    slug: "tv-shows-series",
    description: "Television, Web Series",
    color: "#8B5CF6",
  },
  {
    name: "Music & Artists",
    slug: "music-artists",
    description: "Music Industry, Artists, Albums",
    color: "#EC4899",
  },
  {
    name: "Celebrity Lifestyle",
    slug: "celebrity-lifestyle",
    description: "Celebrity News, Gossip, Lifestyle",
    color: "#F472B6",
  },

  // Sports (4 tags)
  {
    name: "Cricket & IPL",
    slug: "cricket-ipl",
    description: "Cricket, IPL, T20, Test Cricket",
    color: "#10B981",
  },
  {
    name: "Football & Soccer",
    slug: "football-soccer",
    description: "Football News, Leagues, Tournaments",
    color: "#3B82F6",
  },
  {
    name: "Sports Esports",
    slug: "sports-esports",
    description: "Competitive Gaming Sports",
    color: "#8B5CF6",
  },
  {
    name: "Sports News",
    slug: "sports-news",
    description: "General Sports, Updates, Events",
    color: "#F59E0B",
  },

  // Content Format (3 tags)
  {
    name: "Tutorial & Guide",
    slug: "tutorial-guide",
    description: "How-to, Step-by-step Guides",
    color: "#06B6D4",
  },
  {
    name: "News & Updates",
    slug: "news-update",
    description: "Breaking News, Latest Updates",
    color: "#EF4444",
  },
  {
    name: "Opinion & Analysis",
    slug: "opinion-analysis",
    description: "Commentary, Analysis, Opinion Pieces",
    color: "#6366F1",
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

async function checkTagModelExists() {
  const query = `
    query {
      __type(name: "Tag") {
        name
        fields {
          name
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.__type !== null;
}

async function createTag(tag) {
  // Note: Color field removed because Hygraph uses ColorInput type, not String
  // Colors can be added manually in Hygraph UI after creation
  const mutation = `
    mutation CreateTag($name: String!, $slug: String!, $description: String) {
      createTag(data: {
        name: $name
        slug: $slug
        description: $description
      }) {
        id
        name
        slug
      }
    }
  `;

  // Remove color from variables to avoid type mismatch
  const { color, ...tagData } = tag;
  return await graphqlRequest(mutation, tagData);
}
async function publishTag(tagId) {
  const mutation = `
    mutation PublishTag($id: ID!) {
      publishTag(where: { id: $id }, to: PUBLISHED) {
        id
        name
        stage
      }
    }
  `;

  return await graphqlRequest(mutation, { id: tagId });
}

async function main() {
  console.log("\n" + "=".repeat(100));
  console.log("🏷️  CREATING 30 TAGS IN HYGRAPH");
  console.log("=".repeat(100));

  try {
    // Check if Tag model exists
    console.log("\n🔍 Checking if Tag model exists...");
    const modelExists = await checkTagModelExists();

    if (!modelExists) {
      console.error("\n❌ ERROR: Tag model does not exist in Hygraph schema!");
      console.error("\n📝 You must create the Tag model first:");
      console.error("   1. Go to Hygraph Dashboard → Schema");
      console.error("   2. Create new model: Tag");
      console.error("   3. Add fields: name, slug, description, color, posts");
      console.error("   4. See TAG_SETUP_GUIDE.md for detailed instructions");
      console.error("\n💡 After creating the model, run this script again.\n");
      process.exit(1);
    }

    console.log("✅ Tag model found!\n");

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const createdTags = [];

    for (const tag of TAGS) {
      try {
        console.log(`📝 Creating: ${tag.name}...`);
        console.log(`   Slug: ${tag.slug}`);
        console.log(`   Color: ${tag.color}`);

        const result = await createTag(tag);
        console.log(`   ✅ Created ID: ${result.createTag.id}`);

        console.log(`   📤 Publishing...`);
        await publishTag(result.createTag.id);
        console.log(`   ✅ Published\n`);

        created++;
        createdTags.push(result.createTag);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        const errorMsg = error.message;

        // Check if it's a duplicate error
        if (
          errorMsg.includes("unique") ||
          errorMsg.includes("already exists")
        ) {
          console.log(`   ⚠️  Skipped: Already exists\n`);
          skipped++;
        } else {
          console.error(`   ❌ Error: ${errorMsg}\n`);
          errors++;
        }
      }
    }

    console.log("=".repeat(100));
    console.log("✅ TAG CREATION COMPLETE");
    console.log("=".repeat(100));

    console.log(`\n📊 Summary:`);
    console.log(`  • Created: ${created}/${TAGS.length}`);
    console.log(`  • Skipped: ${skipped} (already existed)`);
    console.log(`  • Errors: ${errors}`);

    if (created > 0) {
      console.log("\n🎯 Created Tags:");
      const grouped = {
        Technology: createdTags.slice(0, 8),
        Gaming: createdTags.slice(8, 15),
        Entertainment: createdTags.slice(15, 23),
        Sports: createdTags.slice(23, 27),
        Format: createdTags.slice(27, 30),
      };

      for (const [category, tags] of Object.entries(grouped)) {
        if (tags.length > 0) {
          console.log(`\n  ${category}:`);
          tags.forEach((tag) => {
            console.log(`    • ${tag.name} (${tag.slug})`);
          });
        }
      }
    }

    if (created + skipped === TAGS.length) {
      console.log("\n🎉 All 30 tags are now in Hygraph!");

      console.log("\n📝 Next Steps:");
      console.log("  1. Verify tags in Hygraph CMS");
      console.log("  2. Start tagging posts (via Hygraph UI or script)");
      console.log("  3. Update frontend to display tags");
      console.log("  4. Create tag archive pages");
      console.log("  5. Implement tag filtering");
    }
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
}

main();
