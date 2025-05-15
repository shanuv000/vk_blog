import { getNewsArticles } from "../../services/sitemap-utils";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Check for secret to confirm this is a valid request
    const { secret } = req.query;

    if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get the webhook payload
    const { operation, data } = req.body;

    // Only proceed if this is a relevant operation (create, update, delete, publish, unpublish)
    const relevantOperations = [
      "create",
      "update",
      "delete",
      "publish",
      "unpublish",
    ];
    if (!relevantOperations.includes(operation)) {
      return res
        .status(200)
        .json({ message: "Operation not relevant for sitemap update" });
    }

    // Only proceed if this is a Post model
    if (data.model !== "Post") {
      return res
        .status(200)
        .json({ message: "Model not relevant for sitemap update" });
    }

    console.log(
      `Revalidating sitemap due to ${operation} operation on post: ${data.slug}`
    );

    // In Vercel production environment, we can't write directly to the filesystem
    // Instead, we'll just revalidate the pages which will trigger a new build
    // that will generate a fresh sitemap

    // 1. Revalidate the homepage and post page
    try {
      // Revalidate the homepage
      await res.revalidate("/");
      console.log("Revalidated homepage");

      // Note: We can't directly revalidate static files like sitemap.xml
      // Instead, we'll trigger a revalidation of pages that will cause
      // the sitemap to be regenerated on the next build

      // If we have a slug, revalidate the specific post page
      if (data.slug) {
        await res.revalidate(`/post/${data.slug}`);
        console.log(`Revalidated post page: /post/${data.slug}`);
      }

      // Also revalidate the blog index page
      try {
        await res.revalidate("/blog");
        console.log("Revalidated blog index page");
      } catch (indexError) {
        // If blog index doesn't exist, just log it
        console.log("Blog index page not found, skipping revalidation");
      }

      return res.status(200).json({
        message:
          "Pages revalidated successfully, sitemap will be regenerated on next build",
        operation,
        model: data.model,
        slug: data.slug,
        note: "Static files like sitemap.xml cannot be directly revalidated, but will be updated on next build",
      });
    } catch (error) {
      console.error("Error revalidating pages:", error);
      return res
        .status(500)
        .json({ message: "Error revalidating pages", error: error.message });
    }
  } catch (error) {
    console.error("Error in revalidate-sitemap API:", error);
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
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
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
