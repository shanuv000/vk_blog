#!/usr/bin/env node

/**
 * Update Author Profiles in Hygraph
 * Updates bios for Riya, Anamika, and Shanu K.
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

const AUTHOR_UPDATES = {
  ckypwelvs1rjk0b61soly44i6: {
    // Riya
    name: "Riya",
    bio: `Riya is the lead content creator at VK Blog, specializing in entertainment, gaming, and technology. With a passion for pop culture and a keen eye for trending topics, she brings readers the latest updates on movies, TV shows, esports, and celebrity news. Her engaging writing style and deep knowledge of Marvel, DC, and gaming culture make complex topics accessible to all readers. When she's not writing, Riya can be found binge-watching the latest streaming series or competing in online gaming tournaments.

Expertise: Entertainment, Gaming, Esports, Marvel & DC Comics, Celebrity News, Technology`,
  },
  ckyuvwoww5np50b618vxcj5az: {
    // Anamika
    name: "Anamika",
    bio: `Anamika is a professional fashion designer and style contributor at VK Blog. She shares her unique perspective on fashion trends, design inspiration, and lifestyle topics. With years of experience in the fashion industry, Anamika brings readers exclusive insights into the world of style, creativity, and personal expression through her thoughtfully crafted blog posts.

Expertise: Fashion Design, Style Trends, Lifestyle, Fashion Industry`,
  },
  clw60a2fi0e8w06o6a7056ex4: {
    // Shanu K.
    name: "Shanu K.",
    bio: `Shanu K. is a technology enthusiast and editorial contributor at VK Blog. With expertise in web development, content strategy, and digital innovation, Shanu helps shape the blog's technical direction and ensures quality content across all categories. His diverse interests span from cutting-edge tech to entertainment, bringing a unique perspective to the team.

Expertise: Technology, Web Development, Content Strategy, Editorial, Digital Innovation`,
  },
};

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

async function updateAuthor(authorId, updates) {
  const mutation = `
    mutation UpdateAuthor($id: ID!, $bio: String!) {
      updateAuthor(
        where: { id: $id }
        data: { bio: $bio }
      ) {
        id
        name
        bio
      }
    }
  `;

  return await graphqlRequest(mutation, {
    id: authorId,
    bio: updates.bio,
  });
}

async function publishAuthor(authorId) {
  const mutation = `
    mutation PublishAuthor($id: ID!) {
      publishAuthor(where: { id: $id }, to: PUBLISHED) {
        id
        name
        stage
      }
    }
  `;

  return await graphqlRequest(mutation, { id: authorId });
}

async function main() {
  console.log("\n" + "=".repeat(100));
  console.log("👥 UPDATING AUTHOR PROFILES");
  console.log("=".repeat(100));

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const [authorId, updates] of Object.entries(AUTHOR_UPDATES)) {
      try {
        console.log(`\n📝 Updating ${updates.name}...`);
        console.log(`   Bio preview: ${updates.bio.slice(0, 100)}...`);

        const result = await updateAuthor(authorId, updates);
        console.log(`   ✅ Updated: ${result.updateAuthor.name}`);

        console.log(`   📤 Publishing ${updates.name}...`);
        await publishAuthor(authorId);
        console.log(`   ✅ Published: ${updates.name}`);

        successCount++;

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   ❌ Error updating ${updates.name}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("✅ AUTHOR UPDATE COMPLETE");
    console.log("=".repeat(100));

    console.log(`\n📊 Results:`);
    console.log(
      `  • Successful: ${successCount}/${Object.keys(AUTHOR_UPDATES).length}`
    );
    console.log(`  • Errors: ${errorCount}`);

    if (successCount === Object.keys(AUTHOR_UPDATES).length) {
      console.log("\n🎉 All author profiles updated successfully!");

      console.log("\n📝 Next Steps:");
      console.log("  1. Verify profiles in Hygraph CMS");
      console.log(
        "  2. Add profile pictures via Hygraph UI (if Asset field exists)"
      );
      console.log(
        "  3. Add social media links (requires schema field addition)"
      );
      console.log("  4. Implement author archive pages on frontend");
    }
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
}

main();
