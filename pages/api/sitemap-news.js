/**
 * Dynamic Sitemap News API Route
 *
 * This API route generates the sitemap-news.xml dynamically on request.
 * It's used in conjunction with a URL rewrite in next.config.js to maintain
 * backward compatibility with the original /sitemap-news.xml path.
 *
 * This approach solves two issues:
 * 1. Vercel's read-only filesystem that prevents direct file writes
 * 2. Next.js conflict between static files and dynamic routes
 */

import { getNewsArticles } from "../../services/sitemap-utils";

// Configure API to accept larger requests and disable response size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
    responseLimit: false, // Allow large XML responses
  },
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Set the appropriate content type
  res.setHeader("Content-Type", "text/xml");

  // Set cache control headers to cache the sitemap for 1 hour
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  try {
    // Get the latest posts from Hygraph
    const newsArticles = await getNewsArticles();

    // Generate the XML
    const xml = generateNewsSitemap(newsArticles);

    // Send the XML response
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating sitemap-news.xml:", error);
    res.status(500).send(`Error generating sitemap: ${error.message}`);
  }
}

// Helper function to generate news sitemap XML
function generateNewsSitemap(articles) {
  const today = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

  articles.forEach((article) => {
    xml += "  <url>\n";
    xml += `    <loc>${article.loc}</loc>\n`;
    xml += `    <lastmod>${article.publication_date}</lastmod>\n`;
    xml += "    <news:news>\n";
    xml += "      <news:publication>\n";
    xml += "        <news:name>urTechy Blogs</news:name>\n";
    xml += "        <news:language>en</news:language>\n";
    xml += "      </news:publication>\n";
    xml += `      <news:publication_date>${article.publication_date}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.title)}</news:title>\n`;
    xml += "    </news:news>\n";
    xml += "  </url>\n";
  });

  xml += "</urlset>";
  return xml;
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) {
    return "";
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
