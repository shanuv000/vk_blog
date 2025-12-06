#!/usr/bin/env node

/**
 * Hygraph CMS MCP Server
 * 
 * This Model Context Protocol server provides full access to your Hygraph CMS
 * allowing you to query, mutate, and manage content directly from VS Code.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Configuration from environment
const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
const HYGRAPH_CDN_API = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

if (!HYGRAPH_CONTENT_API) {
  console.error("Error: HYGRAPH_CONTENT_API not configured in .env.local");
  process.exit(1);
}

// Create GraphQL clients
const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
  headers: HYGRAPH_AUTH_TOKEN ? {
    authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
  } : {}
});

const cdnClient = new GraphQLClient(HYGRAPH_CDN_API || HYGRAPH_CONTENT_API);

// Create MCP server
const server = new Server(
  {
    name: "hygraph-cms",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool definitions for Hygraph operations
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hygraph_query",
        description: "Execute a GraphQL query against Hygraph CMS (read-only operations). Use this to fetch posts, categories, authors, or any other content.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "GraphQL query string (e.g., 'query { posts { title slug } }')"
            },
            variables: {
              type: "object",
              description: "Optional GraphQL query variables"
            },
            useCDN: {
              type: "boolean",
              description: "Use CDN endpoint for faster cached responses (default: true)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "hygraph_mutation",
        description: "Execute a GraphQL mutation against Hygraph CMS (create, update, delete operations). Requires authentication token.",
        inputSchema: {
          type: "object",
          properties: {
            mutation: {
              type: "string",
              description: "GraphQL mutation string"
            },
            variables: {
              type: "object",
              description: "GraphQL mutation variables"
            }
          },
          required: ["mutation"]
        }
      },
      {
        name: "get_posts",
        description: "Fetch blog posts with common filters (pagination, categories, featured, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            first: {
              type: "number",
              description: "Number of posts to fetch (default: 10)"
            },
            skip: {
              type: "number",
              description: "Number of posts to skip for pagination"
            },
            slug: {
              type: "string",
              description: "Filter by specific post slug"
            },
            category: {
              type: "string",
              description: "Filter by category slug"
            },
            featured: {
              type: "boolean",
              description: "Filter featured posts only"
            },
            orderBy: {
              type: "string",
              description: "Order posts by field (e.g., 'createdAt_DESC', 'title_ASC')"
            }
          }
        }
      },
      {
        name: "get_categories",
        description: "Fetch all categories from Hygraph CMS",
        inputSchema: {
          type: "object",
          properties: {
            showOnly: {
              type: "boolean",
              description: "Only show categories marked as visible"
            }
          }
        }
      },
      {
        name: "get_post_by_slug",
        description: "Fetch a single post by its slug with full details",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "The post slug"
            }
          },
          required: ["slug"]
        }
      },
      {
        name: "create_post",
        description: "Create a new blog post in Hygraph CMS (requires auth token)",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Post title"
            },
            slug: {
              type: "string",
              description: "Post slug (URL-friendly)"
            },
            excerpt: {
              type: "string",
              description: "Post excerpt/summary"
            },
            content: {
              type: "object",
              description: "Rich text content (Hygraph RichText format)"
            },
            featuredpost: {
              type: "boolean",
              description: "Mark as featured post"
            }
          },
          required: ["title", "slug"]
        }
      },
      {
        name: "update_post",
        description: "Update an existing post in Hygraph CMS (requires auth token)",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Post slug to update"
            },
            data: {
              type: "object",
              description: "Fields to update"
            }
          },
          required: ["slug", "data"]
        }
      },
      {
        name: "publish_post",
        description: "Publish a post in Hygraph CMS (requires auth token)",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Post slug to publish"
            }
          },
          required: ["slug"]
        }
      },
      {
        name: "get_schema_info",
        description: "Get information about Hygraph CMS schema and available types",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

// Resource definitions (for browsing CMS content)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "hygraph://posts",
        name: "All Posts",
        description: "Browse all blog posts",
        mimeType: "application/json"
      },
      {
        uri: "hygraph://posts/featured",
        name: "Featured Posts",
        description: "Browse featured blog posts",
        mimeType: "application/json"
      },
      {
        uri: "hygraph://categories",
        name: "Categories",
        description: "Browse all categories",
        mimeType: "application/json"
      },
      {
        uri: "hygraph://authors",
        name: "Authors",
        description: "Browse all authors",
        mimeType: "application/json"
      }
    ]
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  try {
    let query;
    let data;
    
    switch (uri) {
      case "hygraph://posts":
        query = `
          query GetAllPosts {
            posts(first: 50, orderBy: publishedAt_DESC) {
              id
              title
              slug
              excerpt
              createdAt
              publishedAt
              featuredpost
              categories {
                name
                slug
              }
              author {
                name
                bio
              }
            }
          }
        `;
        data = await cdnClient.request(query);
        break;
        
      case "hygraph://posts/featured":
        query = `
          query GetFeaturedPosts {
            posts(where: { featuredpost: true }, first: 20, orderBy: publishedAt_DESC) {
              id
              title
              slug
              excerpt
              createdAt
              publishedAt
              featuredImage {
                url
                width
                height
              }
              categories {
                name
                slug
              }
              author {
                name
                photo {
                  url
                }
              }
            }
          }
        `;
        data = await cdnClient.request(query);
        break;
        
      case "hygraph://categories":
        query = `
          query GetCategories {
            categories(orderBy: name_ASC) {
              id
              name
              slug
              show
            }
          }
        `;
        data = await cdnClient.request(query);
        break;
        
      case "hygraph://authors":
        query = `
          query GetAuthors {
            authors {
              id
              name
              bio
              photo {
                url
              }
            }
          }
        `;
        data = await cdnClient.request(query);
        break;
        
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
    
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error.message}`);
  }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "hygraph_query": {
        const client = args.useCDN !== false ? cdnClient : contentClient;
        const result = await client.request(args.query, args.variables || {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "hygraph_mutation": {
        if (!HYGRAPH_AUTH_TOKEN) {
          throw new Error("Mutations require HYGRAPH_AUTH_TOKEN in .env.local");
        }
        const result = await contentClient.request(args.mutation, args.variables || {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "get_posts": {
        const filters = [];
        if (args.slug) filters.push(`slug: "${args.slug}"`);
        if (args.category) filters.push(`categories_some: { slug: "${args.category}" }`);
        if (args.featured !== undefined) filters.push(`featuredpost: ${args.featured}`);
        
        const where = filters.length > 0 ? `where: { ${filters.join(', ')} }` : '';
        const first = args.first || 12;
        const skip = args.skip || 0;
        const orderBy = args.orderBy || 'publishedAt_DESC';
        
        const query = `
          query GetPosts {
            posts(${where} first: ${first} skip: ${skip} orderBy: ${orderBy}) {
              id
              title
              slug
              excerpt
              createdAt
              publishedAt
              featuredpost
              featuredImage {
                url
              }
              categories {
                name
                slug
              }
              author {
                name
                bio
                photo {
                  url
                }
              }
            }
          }
        `;
        
        const result = await cdnClient.request(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "get_categories": {
        const where = args.showOnly ? 'where: { show: true }' : '';
        const query = `
          query GetCategories {
            categories(${where} orderBy: name_ASC) {
              id
              name
              slug
              show
            }
          }
        `;
        
        const result = await cdnClient.request(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "get_post_by_slug": {
        const query = `
          query GetPostBySlug($slug: String!) {
            post(where: { slug: $slug }) {
              id
              title
              slug
              excerpt
              content {
                raw
                json
              }
              createdAt
              publishedAt
              updatedAt
              featuredpost
              featuredImage {
                url
                width
                height
              }
              categories {
                name
                slug
              }
              tags {
                id
                name
                slug
                color {
                  hex
                }
              }
              author {
                name
                bio
                photo {
                  url
                }
              }
            }
          }
        `;
        
        const result = await cdnClient.request(query, { slug: args.slug });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "create_post": {
        if (!HYGRAPH_AUTH_TOKEN) {
          throw new Error("Creating posts requires HYGRAPH_AUTH_TOKEN in .env.local");
        }
        
        const mutation = `
          mutation CreatePost($data: PostCreateInput!) {
            createPost(data: $data) {
              id
              title
              slug
              excerpt
              createdAt
            }
          }
        `;
        
        const result = await contentClient.request(mutation, { data: args });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "update_post": {
        if (!HYGRAPH_AUTH_TOKEN) {
          throw new Error("Updating posts requires HYGRAPH_AUTH_TOKEN in .env.local");
        }
        
        // First get the post ID
        const getQuery = `
          query GetPost($slug: String!) {
            post(where: { slug: $slug }) {
              id
            }
          }
        `;
        
        const { post } = await contentClient.request(getQuery, { slug: args.slug });
        
        if (!post) {
          throw new Error(`Post not found: ${args.slug}`);
        }
        
        const mutation = `
          mutation UpdatePost($id: ID!, $data: PostUpdateInput!) {
            updatePost(where: { id: $id }, data: $data) {
              id
              title
              slug
              excerpt
              updatedAt
            }
          }
        `;
        
        const result = await contentClient.request(mutation, { 
          id: post.id, 
          data: args.data 
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "publish_post": {
        if (!HYGRAPH_AUTH_TOKEN) {
          throw new Error("Publishing posts requires HYGRAPH_AUTH_TOKEN in .env.local");
        }
        
        // First get the post ID
        const getQuery = `
          query GetPost($slug: String!) {
            post(where: { slug: $slug }) {
              id
            }
          }
        `;
        
        const { post } = await contentClient.request(getQuery, { slug: args.slug });
        
        if (!post) {
          throw new Error(`Post not found: ${args.slug}`);
        }
        
        const mutation = `
          mutation PublishPost($id: ID!) {
            publishPost(where: { id: $id }) {
              id
              title
              slug
              publishedAt
            }
          }
        `;
        
        const result = await contentClient.request(mutation, { id: post.id });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      case "get_schema_info": {
        const query = `
          query GetSchemaInfo {
            __schema {
              types {
                name
                kind
                description
                fields {
                  name
                  type {
                    name
                    kind
                  }
                }
              }
            }
          }
        `;
        
        const result = await contentClient.request(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}\n\nStack: ${error.stack}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hygraph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
