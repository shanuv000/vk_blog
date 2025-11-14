import fs from "fs";
import path from "path";
import { getNewsArticles } from "../../services/sitemap-utils";

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req, res) {
  // Only allow GET requests in development environment
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // This endpoint should only be used in development
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ 
      message: "This endpoint is only available in development environment",
      info: "In production, sitemaps are generated during build time"
    });
  }

  try {
    // Get the latest posts from Hygraph
    const newsArticles = await getNewsArticles();
    
    // Generate sitemap-news.xml
    const newsXml = generateNewsSitemap(newsArticles);
    
    // Write the sitemap to the public directory
    const sitemapPath = path.join(process.cwd(), "public", "sitemap-news.xml");
    fs.writeFileSync(sitemapPath, newsXml);
    
    return res.status(200).json({ 
      message: "Sitemap generated successfully",
      articleCount: newsArticles.length
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return res.status(500).json({ message: "Error generating sitemap", error: error.message });
  }
}

// Helper function to generate news sitemap XML
function generateNewsSitemap(articles) {
  const today = new Date().toISOString();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';
  
  articles.forEach(article => {
    xml += '  <url>\n';
    xml += `    <loc>${article.loc}</loc>\n`;
    xml += `    <lastmod>${article.publication_date}</lastmod>\n`;
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>urTechy Blogs</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${article.publication_date}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.title)}</news:title>\n`;
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) {return "";}
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, """)
    .replace(/'/g, "'");
}
