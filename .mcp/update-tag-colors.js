import https from "https";

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Tag colors mapping (from original create-tags.js)
const TAG_COLORS = {
  "ai-artificial-intelligence": "#3B82F6",
  "web3-blockchain": "#8B5CF6",
  "gadgets-tech": "#06B6D4",
  "science-innovation": "#10B981",
  cybersecurity: "#EF4444",
  "cloud-computing": "#F59E0B",
  "software-development": "#6366F1",
  "internet-culture": "#EC4899",
  "esports-competitive": "#F43F5E",
  "game-reviews": "#8B5CF6",
  "streaming-twitch": "#A855F7",
  "mobile-gaming": "#14B8A6",
  "console-gaming": "#3B82F6",
  "pc-gaming": "#6366F1",
  "gaming-news": "#F59E0B",
  "mcu-marvel": "#DC2626",
  "dc-comics": "#1E40AF",
  "bollywood-movies": "#F59E0B",
  "hollywood-movies": "#7C3AED",
  "streaming-services": "#EF4444",
  "tv-shows-series": "#8B5CF6",
  "music-artists": "#EC4899",
  "celebrity-lifestyle": "#F472B6",
  "cricket-ipl": "#10B981",
  "football-soccer": "#3B82F6",
  "sports-esports": "#8B5CF6",
  "sports-news": "#F59E0B",
  "tutorial-guide": "#06B6D4",
  "news-update": "#EF4444",
  "opinion-analysis": "#6366F1",
};

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

async function getAllTags() {
  const query = `
    query GetAllTags {
      tags {
        id
        slug
        name
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.tags;
}

async function updateTagColor(tagId, slug, hexColor) {
  const mutation = `
    mutation UpdateTagColor($id: ID!, $color: ColorInput!) {
      updateTag(where: { id: $id }, data: { color: $color }) {
        id
        name
        slug
        color {
          hex
        }
      }
    }
  `;

  const variables = {
    id: tagId,
    color: { hex: hexColor },
  };

  return await graphqlRequest(mutation, variables);
}

async function publishTag(tagId) {
  const mutation = `
    mutation PublishTag($id: ID!) {
      publishTag(where: { id: $id }) {
        id
      }
    }
  `;

  return await graphqlRequest(mutation, { id: tagId });
}

async function main() {
  console.log(
    "\n======================================================================="
  );
  console.log(
    "                🎨 UPDATING TAG COLORS IN HYGRAPH                      "
  );
  console.log(
    "=======================================================================\n"
  );

  try {
    // Get all tags
    console.log("🔍 Fetching all tags from Hygraph...");
    const tags = await getAllTags();
    console.log(`✅ Found ${tags.length} tags\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const tag of tags) {
      const hexColor = TAG_COLORS[tag.slug];

      if (!hexColor) {
        console.log(`⚠️  No color defined for: ${tag.name} (${tag.slug})`);
        skipped++;
        continue;
      }

      try {
        console.log(`📝 Updating: ${tag.name}...`);
        console.log(`   Slug: ${tag.slug}`);
        console.log(`   Color: ${hexColor}`);

        const result = await updateTagColor(tag.id, tag.slug, hexColor);
        console.log(`   ✅ Updated ID: ${result.updateTag.id}`);

        console.log(`   📤 Publishing...`);
        await publishTag(tag.id);
        console.log(`   ✅ Published\n`);

        updated++;

        // Rate limiting - wait 100ms between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
      }
    }

    console.log(
      "\n======================================================================="
    );
    console.log(
      "                ✅ COLOR UPDATE COMPLETE                               "
    );
    console.log(
      "=======================================================================\n"
    );
    console.log("📊 Summary:");
    console.log(`  • Updated: ${updated}/${tags.length}`);
    console.log(`  • Skipped: ${skipped}`);
    console.log(`  • Errors: ${errors}\n`);

    if (updated > 0) {
      console.log("🎉 All tag colors have been updated in Hygraph!\n");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

main();
