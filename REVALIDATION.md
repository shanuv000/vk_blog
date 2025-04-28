# Content Revalidation Guide for OnlyBlog

This document explains how to set up automatic revalidation of your OnlyBlog site when content changes in Hygraph.

## How It Works

1. When content is published in Hygraph, a webhook is triggered
2. The webhook calls our revalidation API endpoint
3. The API endpoint triggers Next.js to regenerate the affected pages
4. Users see the updated content without needing to redeploy the site

## Setup Instructions

### 1. Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Select "Environment Variables" from the left sidebar
4. Add the following variable:
   - Name: `REVALIDATION_TOKEN`
   - Value: `19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35`
5. Make sure it's set for Production, Preview, and Development environments
6. Click "Save"

### 2. Configure Webhook in Hygraph

1. Log in to your Hygraph account
2. Go to your project settings
3. Navigate to "Webhooks"
4. Click "Add Webhook"
5. Configure the webhook:
   - Name: "OnlyBlog Revalidation"
   - URL: `https://onlyblog.vercel.app/api/revalidate?secret=19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35`
   - Triggers: Select "Content Model" and choose:
     - Post
     - Category
   - Events: Select "Published", "Updated", and "Unpublished"
   - Headers: No additional headers needed
   - Payload Template: Use the custom template below

### 3. Custom Payload Template

Copy and paste this JSON into the "Payload Template" field in Hygraph:

```json
{
  "operation": "{{operation}}",
  "data": {
    "id": "{{id}}",
    "slug": "{{slug}}",
    "title": "{{title}}",
    "model": "{{__typename}}",
    "__typename": "{{__typename}}"
  }
}
```

### 4. Test the Webhook

1. Publish a new post in Hygraph
2. Check your Vercel logs to see if the revalidation was triggered
3. Visit your site to see if the new content appears

### 5. Manual Testing

If you need to manually test revalidation for a specific post:

1. Use the included test script:

   ```bash
   # Replace your-post-slug with the actual slug of your post
   node test-post-revalidation.js your-post-slug
   ```

2. Check the output to see if the post was successfully revalidated
3. Visit your site to verify the changes are visible

## Manual Revalidation

You can also manually trigger revalidation by calling the API endpoint:

- Revalidate home page:

  ```bash
  https://onlyblog.vercel.app/api/revalidate?secret=19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35
  ```

- Revalidate a specific post:

  ```bash
  https://onlyblog.vercel.app/api/revalidate?secret=19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35&slug=your-post-slug
  ```

- Revalidate a category page:

  ```bash
  https://onlyblog.vercel.app/api/revalidate?secret=19d9670ea05294f2e1eacb1ef9308cf639e4deaa3bca1261e7342d7a90e9ec35&category=your-category-slug
  ```

## Troubleshooting

If revalidation isn't working:

1. Check your Vercel logs for any errors:
   - Go to Vercel dashboard > Your project > Deployments > Latest deployment > Functions > api/revalidate
   - Look for any error messages in the logs

2. Verify that the webhook is being triggered in Hygraph:
   - Go to Hygraph > Settings > Webhooks > Your webhook > View logs
   - Check if the webhook is being triggered and what response it's receiving

3. Make sure your `REVALIDATION_TOKEN` matches exactly in both the webhook URL and your environment variables

4. Try manually triggering revalidation using one of the API endpoints above

5. If all else fails, you can still manually redeploy your site from Vercel dashboard
