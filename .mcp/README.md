# Hygraph CMS MCP Integration

This directory contains the Model Context Protocol (MCP) server for integrating Hygraph CMS with VS Code, enabling full access to your CMS content directly from your editor.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd .mcp
npm install
```

### 2. Configure Environment

Ensure your `.env.local` file in the project root contains:

```bash
NEXT_PUBLIC_HYGRAPH_CONTENT_API=https://api-ap-south-1.hygraph.com/v2/your-project-id/master
NEXT_PUBLIC_HYGRAPH_CDN_API=https://ap-south-1.cdn.hygraph.com/content/your-project-id/master
HYGRAPH_AUTH_TOKEN=your-auth-token-here  # Required for mutations (create/update/delete)
```

### 3. Test the Server

```bash
npm start
```

### 4. Use in VS Code

Once installed, you can interact with Hygraph CMS using GitHub Copilot Chat by asking questions like:

- "Get the latest 10 blog posts from Hygraph"
- "Show me all featured posts"
- "Fetch the post with slug 'my-blog-post'"
- "List all categories"
- "Create a new blog post titled 'Hello World'"
- "Update the post with slug 'existing-post'"

## 📚 Available Tools

### Read Operations (No Auth Required)

#### `hygraph_query`
Execute any GraphQL query against Hygraph CMS.

**Example:**
```graphql
query {
  posts(first: 5) {
    title
    slug
    createdAt
  }
}
```

#### `get_posts`
Fetch blog posts with filters.

**Parameters:**
- `first`: Number of posts to fetch (default: 10)
- `skip`: Pagination offset
- `slug`: Filter by specific slug
- `category`: Filter by category slug
- `featured`: Filter featured posts only
- `orderBy`: Sort order (e.g., "createdAt_DESC")

#### `get_categories`
Fetch all categories.

**Parameters:**
- `showOnly`: Only return visible categories

#### `get_post_by_slug`
Fetch a single post with full details.

**Parameters:**
- `slug`: The post slug (required)

#### `get_schema_info`
Get Hygraph schema information.

### Write Operations (Requires Auth Token)

#### `hygraph_mutation`
Execute any GraphQL mutation.

#### `create_post`
Create a new blog post.

**Parameters:**
- `title`: Post title (required)
- `slug`: URL-friendly slug (required)
- `excerpt`: Post summary
- `content`: Rich text content
- `featuredpost`: Mark as featured

#### `update_post`
Update an existing post.

**Parameters:**
- `slug`: Post slug to update (required)
- `data`: Object with fields to update (required)

#### `publish_post`
Publish a post.

**Parameters:**
- `slug`: Post slug to publish (required)

## 🔗 Available Resources

Browse CMS content directly:

- `hygraph://posts` - All posts
- `hygraph://posts/featured` - Featured posts only
- `hygraph://categories` - All categories
- `hygraph://authors` - All authors

## 💡 Usage Examples

### Query Posts via Copilot

Simply ask in Copilot Chat:
```
@workspace Show me the latest 5 blog posts from Hygraph
```

Copilot will use the MCP server to fetch and display the posts.

### Fetch a Specific Post

```
Get the blog post with slug "my-first-post" from Hygraph
```

### Create a New Post (Requires Auth)

```
Create a new blog post in Hygraph with title "My New Post" and slug "my-new-post"
```

### Update a Post (Requires Auth)

```
Update the Hygraph post "my-first-post" and set featuredpost to true
```

### Browse Categories

```
Show me all categories from Hygraph
```

## 🔐 Authentication

- **Read operations**: Work with or without auth token (uses CDN endpoint)
- **Write operations**: Require `HYGRAPH_AUTH_TOKEN` in `.env.local`

To get your auth token:
1. Go to your Hygraph project settings
2. Navigate to API Access > Permanent Auth Tokens
3. Create a new token with appropriate permissions
4. Add it to `.env.local` as `HYGRAPH_AUTH_TOKEN`

## 🛠️ Development

### File Structure

```
.mcp/
├── hygraph-server.js    # Main MCP server implementation
├── package.json         # Server dependencies
└── README.md           # This file
```

### Modify the Server

Edit `hygraph-server.js` to add new tools or modify existing ones. The server automatically reloads when you make changes.

### Debug Mode

To see detailed logs:

```bash
NODE_DEBUG=* npm start
```

## 📖 GraphQL Schema

Your Hygraph schema includes:

- **Post**: Blog posts with title, slug, content, featured image, etc.
- **Category**: Post categories with name and slug
- **Author**: Post authors with name, bio, and photo
- **Comment**: Post comments (if enabled)

Use the `get_schema_info` tool to explore the full schema.

## 🚨 Troubleshooting

### Server Won't Start

1. Check that `.env.local` exists and contains `NEXT_PUBLIC_HYGRAPH_CONTENT_API`
2. Ensure dependencies are installed: `cd .mcp && npm install`
3. Verify Node.js version (requires v18+): `node --version`

### Mutations Fail

1. Verify `HYGRAPH_AUTH_TOKEN` is set in `.env.local`
2. Check that your token has the required permissions in Hygraph
3. Ensure the token hasn't expired

### Queries Return Empty

1. Check that your Hygraph project has published content
2. Verify the API endpoint URL is correct
3. Try using the Content API instead of CDN by setting `useCDN: false`

## 🔄 Updates

To update the MCP SDK and dependencies:

```bash
cd .mcp
npm update
```

## 📝 License

This MCP server is part of your Next.js blog project and uses the same license.
