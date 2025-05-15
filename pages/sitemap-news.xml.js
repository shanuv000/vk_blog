import { getNewsArticles } from "../services/sitemap-utils";

// This is a dynamic API route that generates the sitemap-news.xml on-demand
export default async function SitemapNews(req, res) {
  // Set the appropriate content type
  res.setHeader('Content-Type', 'text/xml');
  
  try {
    // Get the latest posts from Hygraph
    const newsArticles = await getNewsArticles();
    
    // Generate the XML
    const xml = generateNewsSitemap(newsArticles);
    
    // Send the XML response
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap-news.xml:', error);
    res.status(500).send('Error generating sitemap');
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
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// This function gets called at build time
export async function getServerSideProps({ res }) {
  // Set cache control headers to cache the sitemap for 1 hour
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  
  return {
    props: {},
  };
}
