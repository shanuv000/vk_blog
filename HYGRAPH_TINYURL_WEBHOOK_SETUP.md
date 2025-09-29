# 🔗 TinyURL Hygraph Webhook Integration Guide

## Overview

This guide will walk you through setting up Hygraph webhooks to automatically shorten URLs when blog posts are published. This creates a seamless workflow where every new post gets a shortened URL without manual intervention.

## 🎯 What You'll Achieve

- **Automatic URL Shortening**: Every published post gets a TinyURL automatically
- **Real-time Processing**: URLs are shortened immediately when posts are published
- **Zero Manual Work**: No need to manually shorten URLs for new posts
- **Reliable Fallbacks**: System continues working even if TinyURL API is down

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ TinyURL integration already set up (from previous setup)
- ✅ Access to your Hygraph CMS dashboard
- ✅ Your blog deployed and accessible online
- ✅ Environment variables configured with `HYGRAPH_WEBHOOK_SECRET`

## 🚀 Step-by-Step Setup

### Step 1: Verify TinyURL Webhook Endpoint

First, let's verify that the webhook endpoint is working:

1. **Check the endpoint exists**: `/pages/api/tinyurl-webhook.js`
2. **Test locally** (optional):
   ```bash
   # Start your dev server
   npm run dev
   
   # Test the webhook endpoint
   curl -X POST "http://localhost:3000/api/tinyurl-webhook?secret=your-secret" \
     -H "Content-Type: application/json" \
     -d '{
       "operation": "publish",
       "data": {
         "__typename": "Post",
         "slug": "test-post",
         "title": "Test Post Title"
       }
     }'
   ```

### Step 2: Log into Hygraph Dashboard

1. **Open Hygraph**: Go to [https://app.hygraph.com/](https://app.hygraph.com/)
2. **Select Your Project**: Choose your urTechy blog project
3. **Navigate to Settings**: Look for the settings/configuration section

### Step 3: Access Webhooks Configuration

1. **Find Webhooks**: In the left sidebar, look for "Settings" → "Webhooks"
2. **View Current Webhooks**: You should see your existing sitemap webhook if it's set up

### Step 4: Create TinyURL Webhook

1. **Click "Add Webhook"** or "Create New Webhook"

2. **Configure Basic Settings**:
   - **Name**: `TinyURL Auto-Shortening`
   - **Description**: `Automatically create shortened URLs for published posts`
   - **URL**: `https://blog.urtechy.com/api/tinyurl-webhook?secret=YOUR_WEBHOOK_SECRET`
   
   ⚠️ **Important**: Replace `YOUR_WEBHOOK_SECRET` with your actual secret from `.env.local`

3. **Set Content Model**:
   - **Content Model**: Select `Post` (or whatever your blog post model is called)
   
4. **Choose Trigger Events**:
   Select these operations:
   - ✅ **Create** (when a new post is created)
   - ✅ **Update** (when a post is modified) 
   - ✅ **Publish** (when a post is published) ⭐ *Most Important*
   
   Leave unchecked:
   - ❌ Delete (not needed for URL shortening)
   - ❌ Unpublish (not needed)

### Step 5: Configure Webhook Payload

1. **Headers Section**:
   ```http
   Content-Type: application/json
   User-Agent: Hygraph-Webhook-TinyURL/1.0
   ```

2. **Body/Payload Section**:
   ```json
   {
     "operation": "{{operation}}",
     "data": {
       "id": "{{id}}",
       "slug": "{{slug}}",
       "title": "{{title}}",
       "__typename": "{{__typename}}",
       "stage": "{{stage}}",
       "createdAt": "{{createdAt}}",
       "updatedAt": "{{updatedAt}}"
     }
   }
   ```

   This payload includes:
   - `operation`: What action triggered the webhook (create, update, publish)
   - `slug`: Required for creating the short URL
   - `title`: Used in the TinyURL description
   - `stage`: Helps determine if the post is published

### Step 6: Configure Advanced Settings

1. **Timeout**: Set to `30 seconds` (TinyURL API needs time to respond)

2. **Retry Policy**:
   - **Max Retries**: `3`
   - **Retry Delay**: `5 seconds`

3. **Security** (if available):
   - **Enable SSL Verification**: ✅ Yes
   - **Follow Redirects**: ✅ Yes

### Step 7: Save and Activate Webhook

1. **Review Settings**: Double-check all configurations
2. **Save Webhook**: Click "Save" or "Create Webhook"
3. **Activate**: Ensure the webhook is enabled/active

## 🧪 Testing the Integration

### Test 1: Create a New Post

1. **Go to Content**: Navigate to your Posts section in Hygraph
2. **Create New Post**: 
   - Add a title: "TinyURL Webhook Test"
   - Add a slug: "tinyurl-webhook-test"
   - Add some content
3. **Publish the Post**: Click "Publish"
4. **Check Logs**: Look for webhook execution in your deployment logs

### Test 2: Verify Short URL Creation

1. **Check Your Website**: Visit your demo page `/tinyurl-demo`
2. **Use the Hook**: The `useTinyUrl` hook should now return the pre-created short URL
3. **Verify in TinyURL Dashboard**: Check [https://tinyurl.com/app/myurls](https://tinyurl.com/app/myurls)

### Test 3: Update Existing Post

1. **Edit a Post**: Make changes to an existing post
2. **Republish**: Save and publish the changes
3. **Verify**: The short URL should be updated or confirmed

## 📊 Monitoring Webhook Activity

### In Hygraph Dashboard

1. **Webhook Logs**: Most webhook sections show recent activity
2. **Success/Failure Rates**: Monitor webhook reliability
3. **Response Times**: Check if webhooks are processing quickly

### In Your Application Logs

Look for these log entries:
```bash
# Successful webhook processing
✅ TinyURL Webhook received: publish for Post with slug: my-awesome-post
✅ Successfully created short URL: https://tinyurl.com/urtechy-my-awesome-post

# Webhook skipped (not relevant)
ℹ️ Operation "delete" not relevant for URL shortening

# Webhook error (but graceful)
⚠️ Failed to create short URL, but webhook processed
```

### In Vercel/Deployment Platform

1. **Functions Log**: Check your serverless function logs
2. **Error Monitoring**: Set up alerts for webhook failures
3. **Performance Metrics**: Monitor webhook response times

## 🔧 Troubleshooting Common Issues

### Issue 1: Webhook Not Firing

**Symptoms**: New posts don't get short URLs automatically

**Solutions**:
1. **Check Webhook Status**: Ensure webhook is enabled in Hygraph
2. **Verify URL**: Confirm webhook URL is correct and accessible
3. **Test Endpoint**: Use curl or Postman to test the webhook endpoint
4. **Check Content Model**: Ensure webhook is set for the correct Post model

### Issue 2: Wrong Secret Error

**Symptoms**: Webhook fires but returns 401 "Invalid token"

**Solutions**:
1. **Check Environment Variable**: Verify `HYGRAPH_WEBHOOK_SECRET` is set correctly
2. **Match Secrets**: Ensure secret in webhook URL matches environment variable
3. **Redeploy**: After changing environment variables, redeploy your application

### Issue 3: Short URLs Not Created

**Symptoms**: Webhook processes but no short URL is generated

**Solutions**:
1. **Check TinyURL API Key**: Verify `TINYURL_API_KEY` is valid
2. **Test TinyURL Service**: Use the demo page to test URL shortening
3. **Check Logs**: Look for TinyURL API errors in webhook logs
4. **Verify Post Data**: Ensure posts have valid slugs and titles

### Issue 4: Webhook Timeouts

**Symptoms**: Webhooks fail due to timeout errors

**Solutions**:
1. **Increase Timeout**: Set webhook timeout to 30+ seconds in Hygraph
2. **Optimize Code**: Review webhook handler for performance bottlenecks
3. **Add Async Processing**: Consider queuing URL shortening for later processing

## 🎨 Advanced Configurations

### Option 1: Store Short URLs in Hygraph

Add a `shortUrl` field to your Post model in Hygraph, then update the webhook to save URLs back:

```javascript
// In the webhook handler, add this after creating the short URL:
await saveShortUrlToHygraph(data.id, shortUrl);
```

**Benefits**:
- Short URLs are stored permanently
- Can be queried directly from Hygraph
- Available in GraphQL queries

### Option 2: Batch Processing

For high-volume blogs, consider batching URL creation:

```javascript
// Collect posts and process in batches
const pendingUrls = [];
// Process every 5 minutes or 10 posts, whichever comes first
```

### Option 3: Conditional Shortening

Only shorten URLs for certain categories or featured posts:

```javascript
// In webhook handler, add conditions:
if (data.featuredPost || data.categories?.includes('important')) {
  // Only shorten URLs for featured or important posts
}
```

## 📈 Analytics and Monitoring

### Track Webhook Performance

1. **Success Rate**: Monitor what percentage of webhooks succeed
2. **Response Time**: Track how long URL shortening takes
3. **Error Patterns**: Identify common failure reasons

### Monitor URL Usage

1. **Click Tracking**: Use TinyURL dashboard to see click rates
2. **Popular Posts**: Identify which posts get shared most
3. **Platform Analytics**: See which social platforms drive traffic

## 🔄 Webhook Maintenance

### Regular Tasks

1. **Monthly Review**: Check webhook logs for any issues
2. **Update Secrets**: Rotate webhook secrets periodically for security
3. **Monitor Quotas**: Ensure you're not hitting TinyURL API limits
4. **Test After Updates**: Verify webhooks work after Hygraph or app updates

### Backup Strategy

1. **Document Configuration**: Keep webhook settings documented
2. **Export URLs**: Regularly export your shortened URLs list
3. **Alternative Endpoints**: Have backup webhook endpoints ready

## 🎯 Success Checklist

After completing setup, verify these items:

- [ ] Webhook is created and active in Hygraph
- [ ] Webhook URL includes correct secret parameter
- [ ] Post model is selected as trigger
- [ ] Publish operation is included in triggers
- [ ] Webhook payload includes slug and title fields
- [ ] Environment variables are set correctly
- [ ] New post creation triggers webhook
- [ ] Short URLs are generated successfully
- [ ] Webhook logs show successful processing
- [ ] Short URLs appear in TinyURL dashboard

## 🚀 Next Steps

Once your webhook is working:

1. **Enable for All Posts**: Let the system run for new posts
2. **Bulk Process Existing**: Use the TinyUrlManager to shorten existing post URLs
3. **Monitor Performance**: Keep an eye on webhook reliability
4. **Optimize as Needed**: Adjust configuration based on usage patterns

## 💡 Pro Tips

1. **Test in Staging First**: Set up webhooks in a staging environment before production
2. **Use Meaningful Secrets**: Generate strong, unique webhook secrets
3. **Monitor API Limits**: Keep track of your TinyURL API usage
4. **Document Everything**: Keep notes about your webhook configuration
5. **Set Up Alerts**: Get notified when webhooks fail consistently

---

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review both Hygraph and application logs
2. **Test Endpoints**: Use tools like Postman to test webhook URLs
3. **Review Documentation**: Refer to Hygraph and TinyURL API docs
4. **Community Support**: Check Hygraph community forums

Your TinyURL webhook integration should now automatically create shortened URLs for every new blog post! 🎉