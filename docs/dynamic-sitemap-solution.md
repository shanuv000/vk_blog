# Dynamic Sitemap Solution

This document explains the solution implemented to fix the sitemap update issue with Hygraph webhooks.

## Problem

The webhook from Hygraph to `https://blog.urtechy.com/api/revalidate-sitemap?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398` was failing with the error:

```
{"message":"Error revalidating pages","error":"Failed to revalidate /sitemap.xml: Invalid response 200"}
```

This error occurs because:

1. Vercel's serverless functions run in a read-only file system, which means they cannot write directly to files like `public/sitemap-news.xml`.
2. Next.js's revalidation API is designed for dynamic pages, not static files like sitemap.xml.

## Solution

We've implemented a dynamic sitemap solution:

1. **Dynamic Sitemap Generation**: Created a dynamic API route at `pages/sitemap-news.xml.js` that generates the sitemap on-demand
2. **Page Revalidation**: Updated the webhook handler to revalidate only dynamic pages, not static files
3. **Cache Control**: Added cache control headers to optimize performance

### Changes Made

1. Created `pages/sitemap-news.xml.js` to:
   - Generate the sitemap dynamically using the same data source
   - Set appropriate cache control headers
   - Serve the sitemap with the correct content type

2. Updated `pages/api/revalidate-sitemap.js` to:
   - Remove attempts to revalidate static files
   - Focus on revalidating dynamic pages

3. Kept the build-time sitemap generation for backward compatibility

## How It Works

1. **Static Generation**: During build time, the sitemap is still generated as a static file
2. **Dynamic Fallback**: The dynamic route serves as a fallback that always provides the latest data
3. **Webhook Handling**: When content changes in Hygraph, the webhook triggers revalidation of dynamic pages
4. **Search Engine Access**: Search engines can access either the static or dynamic version of the sitemap

## Testing

To test this solution:

1. **Access the dynamic sitemap**:
   - Visit `https://blog.urtechy.com/sitemap-news.xml`
   - Verify that it contains the latest posts

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
