# Hygraph MCP Server Quick Reference

## 🎯 Quick Commands

### Installation
```bash
cd .mcp
npm install
```

### Test Server
```bash
cd .mcp
./test.sh
# or
npm start
```

## 💬 Usage in Copilot Chat

### Read Operations (No Auth Required)

| What You Want | Ask Copilot |
|---------------|-------------|
| Latest posts | `@workspace Get the latest 10 blog posts from Hygraph` |
| Featured posts | `@workspace Show me all featured posts from Hygraph` |
| Single post | `@workspace Fetch the post with slug "my-post" from Hygraph` |
| Categories | `@workspace List all categories from Hygraph` |
| Posts by category | `@workspace Show posts in the "Technology" category` |
| Custom query | `@workspace Execute this Hygraph query: { posts { title } }` |

### Write Operations (Requires Auth Token)

| What You Want | Ask Copilot |
|---------------|-------------|
| Create post | `@workspace Create a new blog post in Hygraph titled "Hello World"` |
| Update post | `@workspace Update the Hygraph post "my-post" excerpt to "New summary"` |
| Publish post | `@workspace Publish the Hygraph post "my-post"` |

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | 1. `cd .mcp && npm install`<br>2. Check `.env.local` exists<br>3. Verify `NEXT_PUBLIC_HYGRAPH_CONTENT_API` is set |
| Mutations fail | 1. Add `HYGRAPH_AUTH_TOKEN` to `.env.local`<br>2. Verify token permissions in Hygraph dashboard |
| Empty results | 1. Check content is published in Hygraph<br>2. Try with `useCDN: false` |
| VS Code not seeing MCP | 1. Reload VS Code window<br>2. Check `.vscode/settings.json` |

## 📚 Available Tools

- ✅ `hygraph_query` - Execute GraphQL query
- ✅ `hygraph_mutation` - Execute GraphQL mutation (auth required)
- ✅ `get_posts` - Fetch posts with filters
- ✅ `get_categories` - List categories
- ✅ `get_post_by_slug` - Get single post details
- ✅ `create_post` - Create new post (auth required)
- ✅ `update_post` - Update post (auth required)
- ✅ `publish_post` - Publish post (auth required)
- ✅ `get_schema_info` - Get schema information

## 🔐 Auth Token Setup

1. Go to [Hygraph Dashboard](https://app.hygraph.com/)
2. Settings → API Access → Permanent Auth Tokens
3. Create token with read/write permissions
4. Add to `.env.local`:
   ```bash
   HYGRAPH_AUTH_TOKEN=your-token-here
   ```
5. Reload VS Code window

## 📖 Documentation

- Full Guide: [`HYGRAPH_MCP_SETUP.md`](../HYGRAPH_MCP_SETUP.md)
- Technical Details: [`.mcp/README.md`](.mcp/README.md)

---

**Status**: ✅ Installed and ready to use!
