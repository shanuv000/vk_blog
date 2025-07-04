# Dynamic Sitemap Solution

This document explains the solution implemented to fix the sitemap update issue with Hygraph webhooks.

## Problem

The webhook from Hygraph to `https://blog.urtechy.com/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398` was failing with the error:

```json
{"message":"Error revalidating pages","error":"Failed to revalidate /sitemap.xml: Invalid response 200"}
```

Additionally, we encountered a build error:

```bash
Error: Conflicting public and page file was found. https://nextjs.org/docs/messages/conflicting-public-file-page
/sitemap-news.xml
```

These errors occur because:

1. Vercel's serverless functions run in a read-only file system, which means they cannot write directly to files like `public/sitemap-news.xml`.
2. Next.js's revalidation API is designed for dynamic pages, not static files like sitemap.xml.
3. We can't have both a static file in `/public/sitemap-news.xml` and a dynamic route at `/pages/sitemap-news.xml.js`.

## Solution

We've implemented a fully dynamic sitemap solution:

1. **API Route for Sitemap**: Created an API route at `pages/api/sitemap-news.js` that generates the sitemap on-demand
2. **URL Rewrite**: Added a URL rewrite to maintain backward compatibility with the old sitemap URL
3. **Removed Static File**: Removed the static `public/sitemap-news.xml` file to avoid conflicts
4. **Page Revalidation**: Updated the webhook handler to revalidate only dynamic pages, not static files
5. **Cache Control**: Added cache control headers to optimize performance

### Changes Made

1. Created `pages/api/sitemap-news.js` to:
   - Generate the sitemap dynamically using the same data source
   - Set appropriate cache control headers
   - Serve the sitemap with the correct content type

2. Updated `pages/api/revalidate-sitemap.js` to:
   - Remove attempts to revalidate static files
   - Focus on revalidating dynamic pages

3. Removed the static sitemap-news.xml file and its generation script from the build process

## How It Works

1. **API Route Generation**: The sitemap is now generated on-demand via the API route
2. **Webhook Handling**: When content changes in Hygraph, the webhook triggers revalidation of dynamic pages
3. **Backward Compatibility**: Search engines can still access the sitemap at the original URL (`/sitemap-news.xml`) which is rewritten to the API route
4. **Improved Reliability**: The API route approach is more reliable in serverless environments

## Testing

To test this solution:

1. **Access the sitemap**:
   - Visit both URLs to verify they work:
     - Original URL: `https://blog.urtechy.com/sitemap-news.xml`
     - API route: `https://blog.urtechy.com/api/sitemap-news`
   - Verify that both contain the latest posts

2. **Test the webhook**:

   ```bash
   curl -X POST "https://blog.urtechy.com/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
     -H "Content-Type: application/json" \
     -d '{"operation":"publish","data":{"id":"test-id","slug":"test-slug","model":"Post"}}'
   ```

   - Verify that the response is successful
   - Check that dynamic pages are revalidated

## Benefits

1. **Always Up-to-Date**: The sitemap is always up-to-date, even if the webhook fails
2. **Performance**: Cache control headers optimize performance
3. **Reliability**: No dependency on file system writes in a serverless environment
4. **SEO Friendly**: Search engines can still discover all content

## Implementation Details

The dynamic sitemap route uses `getServerSideProps` with cache control headers to optimize performance while ensuring the data is fresh. It fetches data directly from Hygraph using the same utilities as the static generation process.

This approach provides the best of both worlds: the performance benefits of static generation with the freshness of dynamic generation.
