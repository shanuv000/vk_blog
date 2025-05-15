# Sitemap Update Fix

This document explains the changes made to fix the sitemap update issue with Hygraph webhooks.

## Problem

The webhook from Hygraph to `https://blog.urtechy.com/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398` was failing with the error:

```
{"message":"Model not relevant for sitemap update"}
```

Upon further investigation, we found that the webhook was correctly set up, but there was an issue with the file system in the production environment. Vercel's serverless functions run in a read-only file system, which means they cannot write directly to files like `public/sitemap-news.xml`.

## Solution

We've implemented a two-part solution:

1. **Build-time Sitemap Generation**: The sitemap is now generated during the build process
2. **Page Revalidation**: Instead of trying to write to files directly, we use Next.js's Incremental Static Regeneration (ISR) to revalidate pages

### Changes Made

1. Updated `pages/api/revalidate-sitemap.js` to:
   - Remove direct file writing
   - Focus on revalidating pages including `/sitemap.xml` and `/sitemap-news.xml`

2. Created `scripts/build-sitemap.js` to:
   - Generate the sitemap during build time
   - Run before the Next.js build process

3. Updated `package.json` scripts to:
   - Run the sitemap generation script before building
   - Add a dedicated script for manual sitemap generation

4. Updated documentation in `docs/hygraph-webhook-setup.md` to:
   - Explain the new approach
   - Provide updated troubleshooting steps

## Testing

To test these changes:

1. **Local Development**:
   - Start the development server: `npm run dev`
   - Generate the sitemap manually: `npm run generate-sitemap`
   - Test the webhook with curl:
     ```bash
     curl -X POST "http://localhost:3000/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
       -H "Content-Type: application/json" \
       -d '{"operation":"publish","data":{"id":"test-id","slug":"test-slug","model":"Post"}}'
     ```

2. **Production**:
   - Deploy the changes to Vercel
   - Test the webhook with curl:
     ```bash
     curl -X POST "https://blog.urtechy.com/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
       -H "Content-Type: application/json" \
       -d '{"operation":"publish","data":{"id":"test-id","slug":"test-slug","model":"Post"}}'
     ```
   - Verify that the response indicates successful revalidation
   - Check that the pages are revalidated by visiting them

## Deployment

1. Commit and push these changes to your repository
2. Deploy to Vercel
3. Verify that the sitemap is generated during the build process
4. Test the webhook as described above

## Additional Notes

- The sitemap is now generated during each build, ensuring it's always up to date
- When content changes in Hygraph, the webhook triggers revalidation of relevant pages
- This approach is compatible with Vercel's serverless architecture and read-only file system
- The webhook secret remains the same, so no changes are needed in the Hygraph webhook configuration
