# Setting Up Hygraph Webhooks for Sitemap Updates

This document explains how to set up webhooks in Hygraph to automatically update your sitemap when content changes.

## How Sitemap Updates Work

In our setup, there are two ways the sitemap gets updated:

1. **During Build Time**: The sitemap is automatically generated during each build process
2. **Via Webhooks**: When content changes in Hygraph, a webhook triggers page revalidation

Due to Vercel's read-only filesystem in production, we can't directly write to the sitemap file. Instead, we use Next.js's Incremental Static Regeneration (ISR) to revalidate pages, which will trigger a rebuild of the affected pages and update the sitemap.

## Prerequisites

1. A Hygraph account with access to your project
2. Your website deployed with the revalidation API endpoint

## Steps to Set Up the Webhook

1. **Generate a Secret Token**

   Generate a random string to use as your webhook secret. You can use an online generator or run this command:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Variables**

   Add the generated secret to your environment variables:

   ```bash
   HYGRAPH_WEBHOOK_SECRET=your-generated-secret
   ```

   Make sure to add this to your production environment variables as well (e.g., in Vercel).

3. **Log in to Hygraph**

   Go to [https://app.hygraph.com/](https://app.hygraph.com/) and select your project.

4. **Navigate to Webhooks**

   In the sidebar, click on "Settings" and then "Webhooks".

5. **Create a New Webhook**

   Click on "Add Webhook" and fill in the following details:

   - **Name**: Sitemap Update
   - **URL**: `https://blog.urtechy.com/api/revalidate-sitemap?secret=your-generated-secret`
   - **Triggers**: Select the following:
     - Content Model: Post
     - Operations: Create, Update, Delete, Publish, Unpublish

6. **Set Up the Payload**

   In the "Headers" section, add:

   ```http
   Content-Type: application/json
   ```

   In the "Body" section, add the following JSON:

   ```json
   {
     "operation": "{{operation}}",
     "data": {
       "id": "{{id}}",
       "slug": "{{slug}}",
       "model": "{{__typename}}"
     }
   }
   ```

7. **Save the Webhook**

   Click "Save" to create the webhook.

## Testing the Webhook

1. Create or update a post in Hygraph
2. Publish the post
3. Check your website logs to see if the revalidation endpoint was called
4. Visit the revalidated pages to verify they've been updated

## Troubleshooting

If the webhook isn't working:

1. Check that the secret in your environment variables matches the one in the webhook URL
2. Verify that the webhook URL is correct and accessible
3. Check your server logs for any errors
4. Make sure the post has a valid slug
5. Verify that the payload format matches what the API endpoint expects

## Additional Information

- The webhook will only trigger for the Post content model
- The sitemap is regenerated during each build
- In development, you can manually generate the sitemap by running `npm run generate-sitemap`
- In production, the sitemap is updated through the build process, not by direct file writes
