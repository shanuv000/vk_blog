// next-sitemap.config.js
require("dotenv").config();
const { getNewsArticles } = require("./services/sitemap-utils");

module.exports = {
  siteUrl: "https://onlyblog.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/admin/**", "/user/**"],
  additionalSitemaps: [
    {
      loc: "/sitemap-news.xml",
      lastmod: new Date().toISOString(),
    },
  ],
  extraPaths: async () => {
    const newsArticles = await getNewsArticles();
    return newsArticles.map((article) => ({
      loc: article.loc,
      lastmod: article.publication_date,
    }));
  },
  transform: async (_, path) => {
    const articles = await getNewsArticles();
    const article = articles.find((article) => article.loc === path);
    return {
      loc: article ? article.loc : path,
      news: article
        ? {
            publication: {
              name: "OnlyBlog News",
              language: "en",
            },
            publication_date: article.publication_date,
            title: article.title,
          }
        : undefined,
    };
  },
};
