# Hygraph CMS MCP Integration Guide

## 📋 Overview

This guide explains how to use the Hygraph CMS Model Context Protocol (MCP) server to interact with your Hygraph content management system directly from VS Code.

## ✅ What's Been Set Up

### 1. MCP Server Configuration
- **Location**: `.mcp/hygraph-server.js`
- **Purpose**: Provides a bridge between VS Code and your Hygraph CMS
- **Features**:
  - Read operations (queries)
  - Write operations (mutations)
  - Resource browsing
  - Full GraphQL access

### 2. VS Code Integration
- **Settings**: Added to `.vscode/settings.json`
- **Server Name**: `hygraph-cms`
- **Auto-loads**: When you open this workspace

### 3. Available Operations

#### 🔍 Read Operations (No Auth Required)

1. **Query Posts**
   ```
   @workspace Get the latest 10 blog posts from Hygraph
   ```

2. **Filter Posts by Category**
   ```
   @workspace Show me posts in the "Technology" category
   ```

3. **Get Featured Posts**
   ```
   @workspace List all featured posts from Hygraph
   ```

4. **Get Single Post**
   ```
   @workspace Fetch the post with slug "my-blog-post" from Hygraph
   ```

5. **List Categories**
   ```
   @workspace Show me all categories from Hygraph
   ```

6. **Custom GraphQL Query**
   ```
   @workspace Execute this Hygraph query: { posts { title author { name } } }
   ```

#### ✏️ Write Operations (Requires Auth Token)

1. **Create Post**
   ```
   @workspace Create a new blog post in Hygraph with title "My New Post" and slug "my-new-post"
   ```

2. **Update Post**
   ```
   @workspace Update the Hygraph post "my-first-post" and set the excerpt to "Updated summary"
   ```

3. **Publish Post**
   ```
   @workspace Publish the Hygraph post with slug "draft-post"
   ```

## 🚀 Installation Steps

### Step 1: Install MCP Server Dependencies

```bash
cd .mcp
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP server framework
- `graphql-request` - GraphQL client
- `dotenv` - Environment variable loader
- `graphql` - GraphQL core library

### Step 2: Verify Environment Variables

Check your `.env.local` file in the project root contains:

```bash
# Required for read operations
NEXT_PUBLIC_HYGRAPH_CONTENT_API=https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master
NEXT_PUBLIC_HYGRAPH_CDN_API=https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master

# Required for write operations (create/update/delete/publish)
HYGRAPH_AUTH_TOKEN=your-permanent-auth-token-here
```

### Step 3: Get Your Auth Token (For Write Operations)

1. Go to [Hygraph Dashboard](https://app.hygraph.com/)
2. Select your project
3. Navigate to **Settings** → **API Access** → **Permanent Auth Tokens**
4. Click **Create Token**
5. Give it a name (e.g., "MCP Server")
6. Select permissions:
   - ✅ Read content
   - ✅ Create content
   - ✅ Update content
   - ✅ Delete content
   - ✅ Publish content
7. Copy the token and add it to `.env.local` as `HYGRAPH_AUTH_TOKEN`

### Step 4: Reload VS Code Window

1. Open Command Palette: `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Developer: Reload Window"
3. Press Enter

The MCP server will now be active!

## 💬 Using with GitHub Copilot Chat

Once set up, you can interact with Hygraph CMS naturally through Copilot Chat:

### Example Conversations

**You:** "Show me the latest 5 blog posts from Hygraph"

**Copilot:** Uses the `get_posts` tool to fetch and display posts with titles, slugs, and creation dates.

---

**You:** "Get all posts in the 'Cricket' category"

**Copilot:** Filters posts by category slug and returns matching posts.

---

**You:** "What categories are available in Hygraph?"

**Copilot:** Uses `get_categories` to list all categories.

---

**You:** "Create a new blog post about React 19"

**Copilot:** Uses `create_post` to create a new post (requires auth token).

## 🛠️ Advanced Usage

### Custom GraphQL Queries

You can execute any GraphQL query:

```
@workspace Execute this Hygraph query:

query {
  posts(where: { createdAt_gt: "2024-01-01" }) {
    title
    slug
    author {
      name
      photo {
        url
      }
    }
    categories {
      name
    }
  }
}
```

### Complex Mutations

```
@workspace Execute this Hygraph mutation:

mutation {
  updatePost(
    where: { slug: "my-post" }
    data: {
      title: "Updated Title"
      featuredpost: true
      excerpt: "New excerpt"
    }
  ) {
    id
    title
    updatedAt
  }
}
```

## 📊 Available MCP Tools

| Tool | Purpose | Auth Required |
|------|---------|---------------|
| `hygraph_query` | Execute GraphQL query | No |
| `hygraph_mutation` | Execute GraphQL mutation | Yes |
| `get_posts` | Fetch posts with filters | No |
| `get_categories` | List all categories | No |
| `get_post_by_slug` | Get single post | No |
| `create_post` | Create new post | Yes |
| `update_post` | Update existing post | Yes |
| `publish_post` | Publish a post | Yes |
| `get_schema_info` | Get schema information | No |

## 🔍 Browsing Resources

You can also browse Hygraph content as resources:

- `hygraph://posts` - All posts
- `hygraph://posts/featured` - Featured posts
- `hygraph://categories` - All categories
- `hygraph://authors` - All authors

Ask Copilot:
```
@workspace Show me the hygraph://posts/featured resource
```

## 🐛 Troubleshooting

### MCP Server Not Working

1. **Check server is running:**
   ```bash
   cd .mcp
   npm start
   ```
   You should see: "Hygraph MCP Server running on stdio"

2. **Verify VS Code settings:**
   - Check `.vscode/settings.json` contains the `mcpServers` configuration
   - Reload VS Code window

3. **Check environment variables:**
   - Ensure `.env.local` exists in project root
   - Verify `NEXT_PUBLIC_HYGRAPH_CONTENT_API` is set

### Mutations Not Working

1. **Verify auth token:**
   - Check `HYGRAPH_AUTH_TOKEN` in `.env.local`
   - Token should start with `eyJ...` or similar

2. **Check token permissions:**
   - Go to Hygraph dashboard
   - Verify token has write permissions

3. **Test with a query first:**
   - Try a read operation to ensure server is working
   - Then attempt the mutation

### Getting Empty Results

1. **Check content exists:**
   - Go to Hygraph dashboard
   - Verify content is published

2. **Try Content API:**
   - Add `"useCDN": false` to query parameters
   - CDN may have stale data

## 📚 Next Steps

1. ✅ **Installation Complete** - Follow installation steps above
2. 🧪 **Test It Out** - Try simple queries in Copilot Chat
3. 🔐 **Add Auth Token** - Enable write operations
4. 🚀 **Use It** - Manage your CMS content from VS Code!

## 🎯 Benefits

- **Faster Content Management**: No need to switch between VS Code and Hygraph dashboard
- **AI-Powered**: Use natural language to query and manage content
- **Integrated Workflow**: Combine content management with code development
- **Full Control**: Access to complete GraphQL API
- **Offline Development**: Query cached content even when offline

## 📝 Example Workflow

1. **Start development session:**
   ```
   @workspace Show me all posts in Hygraph
   ```

2. **Check specific content:**
   ```
   @workspace Get the post with slug "homepage-hero"
   ```

3. **Make changes:**
   ```
   @workspace Update the "homepage-hero" post excerpt to "Welcome to our new site"
   ```

4. **Verify changes:**
   ```
   @workspace Get the updated post "homepage-hero"
   ```

5. **Publish when ready:**
   ```
   @workspace Publish the post "homepage-hero"
   ```

All without leaving VS Code! 🎉

## 🤝 Support

If you encounter issues:

1. Check the [.mcp/README.md](.mcp/README.md) for technical details
2. Review error messages in Copilot Chat
3. Test the server manually: `cd .mcp && npm start`
4. Check Hygraph API status at [status.hygraph.com](https://status.hygraph.com/)

---

**Happy coding! 🚀**
