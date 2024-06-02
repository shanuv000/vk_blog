// next-sitemap.config.js

const { request, gql } = require("graphql-request");

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

async function getNewsArticles() {
  const query = gql`
    query GetNewsArticles {
      postsConnection(first: 100, orderBy: createdAt_DESC) {
        edges {
          node {
            slug
            title
            createdAt
          }
        }
      }
    }
  `;

  const result = await request(graphqlAPI, query);

  return result.postsConnection.edges.map(({ node }) => ({
    loc: `https://onlyblog.vercel.app/${node.slug}`,
    publication_date: node.createdAt,
    title: node.title,
  }));
}

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
  extraPaths: async (config) => {
    const newsArticles = await getNewsArticles();
    return newsArticles.map((article) => ({
      loc: article.loc,
      lastmod: article.publication_date,
    }));
  },
  transform: async (config, path) => {
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
