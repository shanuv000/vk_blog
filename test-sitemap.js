// Test script to generate the news sitemap
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getNewsArticles } = require('./services/sitemap-utils');

async function generateNewsSitemap() {
  try {
    console.log('Generating news sitemap...');
    
    // Get all posts from Hygraph
    const articles = await getNewsArticles();
    
    if (!articles || articles.length === 0) {
      console.log('No articles found for news sitemap');
      return;
    }
    
    console.log(`Found ${articles.length} articles for news sitemap`);
    console.log('First article:', articles[0]);
    
    // Generate the XML
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
    
    // Write the file to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, 'sitemap-news.xml');
    
    fs.writeFileSync(filePath, xml);
    console.log(`News sitemap generated at ${filePath}`);
    
    // Also update the main sitemap.xml to include the news sitemap
    updateMainSitemap();
  } catch (error) {
    console.error('Error generating news sitemap:', error);
  }
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper function to update the main sitemap.xml
function updateMainSitemap() {
  try {
    const mainSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    // Create the sitemap index XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <sitemap>\n';
    xml += '    <loc>https://blog.urtechy.com/sitemap-0.xml</loc>\n';
    xml += '  </sitemap>\n';
    xml += '  <sitemap>\n';
    xml += '    <loc>https://blog.urtechy.com/sitemap-news.xml</loc>\n';
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '</sitemapindex>';
    
    fs.writeFileSync(mainSitemapPath, xml);
    console.log(`Main sitemap updated at ${mainSitemapPath}`);
  } catch (error) {
    console.error('Error updating main sitemap:', error);
  }
}

// Run the function
generateNewsSitemap();
