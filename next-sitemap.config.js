// next-sitemap.config.js
require("dotenv").config();
const {
  getNewsArticles,
  getCategorySlugs,
} = require("./services/sitemap-utils");

module.exports = {
  siteUrl: "https://blog.urtechy.com",
  generateRobotsTxt: true,
  exclude: ["/admin/**", "/user/**", "/api/**"],
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  additionalSitemaps: [
    {
      loc: "/sitemap-news.xml",
      lastmod: new Date().toISOString(),
    },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: [
      "https://blog.urtechy.com/sitemap.xml",
      "https://blog.urtechy.com/sitemap-news.xml",
    ],
  },
  extraPaths: async () => {
    try {
      // Get all posts
      const newsArticles = await getNewsArticles();
      const postPaths = newsArticles.map((article) => ({
        loc: article.loc,
        lastmod: article.publication_date,
        changefreq: "weekly",
        priority: 0.8,
      }));

      // Get all categories
      const categoryPaths = await getCategorySlugs();

      // Combine all paths
      return [...postPaths, ...categoryPaths];
    } catch (error) {
      console.error("Error generating extra paths for sitemap:", error);
      return [];
    }
  },
  transform: async (config, path) => {
    try {
      // For post pages, add news metadata
      if (path.includes("/post/")) {
        const articles = await getNewsArticles();
        const article = articles.find((article) => article.loc === path);

        if (article) {
          return {
            loc: path,
            changefreq: "weekly",
            priority: 0.8,
            lastmod: article.publication_date,
            news: {
              publication: {
                name: "urTechy Blogs",
                language: "en",
              },
              publication_date: article.publication_date,
              title: article.title,
            },
          };
        }
      }

      // For category pages
      if (path.includes("/category/")) {
        return {
          loc: path,
          changefreq: "daily",
          priority: 0.7,
        };
      }

      // For homepage and other pages
      if (path === "/") {
        return {
          loc: path,
          changefreq: "daily",
          priority: 1.0,
        };
      }

      // Default transformation
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
      };
    } catch (error) {
      console.error(`Error transforming path ${path} for sitemap:`, error);
      return { loc: path };
    }
  },
};
