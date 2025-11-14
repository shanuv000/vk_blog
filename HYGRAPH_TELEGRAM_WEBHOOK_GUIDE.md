# 🔔 Hygraph to Telegram Webhook Integration Guide

Complete guide to set up real-time Telegram notifications for all Hygraph CMS updates.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Verify Environment Variables](#step-1-verify-environment-variables)
4. [Step 2: Test the Webhook Locally](#step-2-test-the-webhook-locally)
5. [Step 3: Deploy to Production](#step-3-deploy-to-production)
6. [Step 4: Configure Hygraph Webhooks](#step-4-configure-hygraph-webhooks)
7. [Step 5: Test the Integration](#step-5-test-the-integration)
8. [Supported Events](#supported-events)
9. [Notification Format](#notification-format)
10. [Troubleshooting](#troubleshooting)
11. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

This integration sends real-time Telegram notifications whenever content changes in your Hygraph CMS:

- ✅ **All Content Types**: Posts, Categories, Authors, Comments, Assets, etc.
- ✅ **All Operations**: Create, Update, Delete, Publish, Unpublish
- ✅ **Rich Formatting**: Emojis, markdown, and direct links
- ✅ **Secure**: Uses webhook secret validation
- ✅ **Fast**: Responds within seconds of CMS changes

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Hygraph CMS project with content
- [x] Telegram bot created (Token: `8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ`)
- [x] Telegram Chat ID (`866021016`)
- [x] Hygraph Webhook Secret in `.env.local`
- [x] Next.js project deployed or running locally

---

## 📝 Step 1: Verify Environment Variables

### 1.1 Check Your `.env.local` File

Ensure your `.env.local` file contains:

```bash
# Hygraph Configuration
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398

# Telegram Configuration
TELEGRAM_CHAT_ID=866021016
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
```

### 1.2 Verify the Values

```bash
# From your project root
cat .env.local | grep -E "HYGRAPH_WEBHOOK_SECRET|TELEGRAM_CHAT_ID|HYGRAPH_TELEGRAM_BOT_TOKEN"
```

Expected output:

```
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
TELEGRAM_CHAT_ID=866021016
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
```

---

## 🧪 Step 2: Test the Webhook Locally

### 2.1 Start Your Development Server

```bash
npm run dev
```

Wait for the server to start (usually at `http://localhost:3000`).

### 2.2 Test with Sample Payload

Open a new terminal and run:

```bash
curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "id": "test-123",
      "slug": "test-post",
      "title": "Test Blog Post",
      "__typename": "Post"
    }
  }'
```

### 2.3 Expected Response

You should see:

```json
{
  "success": true,
  "message": "Webhook processed and Telegram notification sent",
  "data": {
    "operation": "publish",
    "contentType": "Post",
    "contentId": "test-123",
    "telegramMessageId": 12345
  }
}
```

### 2.4 Check Telegram

Open your Telegram chat (ID: `866021016`) and verify you received a notification like:

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: Test Blog Post
🔗 Slug: test-post
🆔 ID: test-123

🌐 View Post:
blog.urtechy.com/post/test-post

⏰ Time: 20 Oct 2025, 2:30 PM
🔧 Environment: development

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

---

## 🚀 Step 3: Deploy to Production

### 3.1 If Using Vercel

```bash
# Commit your changes
git add .
git commit -m "Add Hygraph to Telegram webhook integration"
git push origin main
```

Vercel will automatically deploy your changes.

### 3.2 Get Your Production URL

After deployment completes, note your production URL:

- Example: `https://blog.urtechy.com`
- Or: `https://your-project.vercel.app`

### 3.3 Verify Environment Variables in Production

In Vercel Dashboard:

1. Go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Verify these variables exist:
   - `HYGRAPH_WEBHOOK_SECRET`
   - `TELEGRAM_CHAT_ID`
   - `HYGRAPH_TELEGRAM_BOT_TOKEN`

If missing, add them and redeploy.

---

## ⚙️ Step 4: Configure Hygraph Webhooks

### 4.1 Login to Hygraph

1. Go to [Hygraph Dashboard](https://app.hygraph.com)
2. Select your project: `cky5wgpym15ym01z44tk90zeb`

### 4.2 Navigate to Webhooks

1. Click on **Settings** in the left sidebar
2. Click on **Webhooks**
3. Click **Create** or **Add Webhook**

### 4.3 Configure the Webhook

Fill in the following details:

**Basic Settings:**

- **Name**: `Telegram Notifications`
- **Description**: `Send real-time notifications to Telegram for all content changes`

**Endpoint:**

```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

**Important**: Replace `blog.urtechy.com` with your actual domain if different.

**Trigger Settings:**

Select **ALL** of the following:

**Operations:**

- ✅ Create
- ✅ Update
- ✅ Delete
- ✅ Publish
- ✅ Unpublish

**Models:** (Select all that you want notifications for)

- ✅ Post
- ✅ Category
- ✅ Author
- ✅ Comment
- ✅ Asset
- ✅ (Any other custom models)

**Stages:**

- ✅ DRAFT
- ✅ PUBLISHED

**Request Headers:** (Optional, but recommended)

```
Content-Type: application/json
X-Webhook-Source: Hygraph
```

**Payload:**

Use the following JSON payload template:

```json
{
  "operation": "{{operation}}",
  "data": {
    "id": "{{id}}",
    "slug": "{{slug}}",
    "title": "{{title}}",
    "name": "{{name}}",
    "__typename": "{{__typename}}",
    "stage": "{{stage}}"
  }
}
```

**Include Secret:**

- ✅ Include in Query Parameters (already in URL)

### 4.4 Save the Webhook

Click **Create Webhook** or **Save**.

---

## ✅ Step 5: Test the Integration

### 5.1 Test with a Real Content Update

1. Go to your Hygraph Content area
2. Open any existing blog post
3. Make a small change (e.g., update the title)
4. Click **Save**
5. Check your Telegram chat for the notification

### 5.2 Test Publish Event

1. Create a new draft post in Hygraph
2. Fill in the required fields (title, slug, content)
3. Click **Save**
4. Click **Publish**
5. Check Telegram - you should receive 2 notifications:
   - One for "Created"
   - One for "Published"

### 5.3 Test Different Content Types

Try updating:

- **Category**: Create or update a category
- **Author**: Update an author profile
- **Comment**: Add a comment (if enabled)

Each should trigger a Telegram notification.

### 5.4 Check Webhook Logs in Hygraph

1. Go back to **Settings** → **Webhooks**
2. Click on your "Telegram Notifications" webhook
3. Click on the **Logs** tab
4. Verify you see successful requests (Status 200)

---

## 📊 Supported Events

### Operations Tracked

| Operation   | Emoji | Description         | Example             |
| ----------- | ----- | ------------------- | ------------------- |
| `create`    | 🆕    | New content created | New blog post draft |
| `update`    | ✏️    | Content modified    | Edit post title     |
| `delete`    | 🗑️    | Content removed     | Delete old post     |
| `publish`   | 🚀    | Content published   | Publish draft post  |
| `unpublish` | 📦    | Content unpublished | Unpublish live post |

### Content Types Supported

| Type          | Emoji | Notification Includes    |
| ------------- | ----- | ------------------------ |
| Post          | 📰    | Title, Slug, Direct Link |
| Category      | 📁    | Name, Slug               |
| Author        | 👤    | Name, ID                 |
| Comment       | 💬    | Content preview, Post    |
| Asset         | 🖼️    | File name, Type          |
| Custom Models | 📄    | ID, Available fields     |

---

## 💬 Notification Format

### Example: Post Published

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: 10 Tips for Better SEO
🔗 Slug: 10-tips-better-seo
🆔 ID: cm1abc123xyz

🌐 View Post:
blog.urtechy.com/post/10-tips-better-seo

⏰ Time: 20 Oct 2025, 2:45 PM
🔧 Environment: production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

### Example: Category Created

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🆕 Created - 📁 Category
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Name: Web Development
🔗 Slug: web-development
🆔 ID: cm2def456uvw

⏰ Time: 20 Oct 2025, 3:00 PM
🔧 Environment: production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

---

## 🔧 Troubleshooting

### Problem: No Telegram Notifications

**Solutions:**

1. **Check webhook is active in Hygraph**

   - Go to Settings → Webhooks
   - Ensure webhook is enabled (toggle switch ON)

2. **Verify webhook logs**

   - Check Hygraph webhook logs for errors
   - Look for 401 (auth error) or 500 (server error)

3. **Test the endpoint directly**

   ```bash
   curl -X POST "https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"operation":"publish","data":{"id":"test","__typename":"Post"}}'
   ```

4. **Check Telegram Bot Token**
   - Verify the bot token is correct in `.env.local`: `HYGRAPH_TELEGRAM_BOT_TOKEN`
   - Test by sending a message directly:
   ```bash
   curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Test"
   ```

### Problem: 401 Unauthorized Error

**Solution:**

- Verify the webhook secret in the URL matches `HYGRAPH_WEBHOOK_SECRET` in `.env.local`
- Check there are no extra spaces or characters
- Redeploy if you recently changed environment variables

### Problem: 405 Method Not Allowed

**Solution:**

- Ensure Hygraph is using POST method (not GET)
- Check webhook configuration in Hygraph

### Problem: Duplicate Notifications

**Solution:**

- Check if you have multiple webhooks configured for the same events
- Disable or delete duplicate webhooks in Hygraph

### Problem: Missing Post Links

**Solution:**

- Ensure the `slug` field is included in the webhook payload
- Verify the post has a slug value in Hygraph

---

## 🚀 Advanced Configuration

### Option 1: Filter Specific Content Types

Edit `/pages/api/hygraph-telegram-webhook.js`:

```javascript
// Only notify for Posts and Categories
const allowedTypes = ["Post", "Category"];
if (!allowedTypes.includes(data.__typename)) {
  return res.status(200).json({
    success: true,
    message: `Content type ${data.__typename} is filtered`,
    skipped: true,
  });
}
```

### Option 2: Filter Specific Operations

```javascript
// Only notify for publish operations
const allowedOperations = ["publish"];
if (!allowedOperations.includes(operation)) {
  return res.status(200).json({
    success: true,
    message: `Operation ${operation} is filtered`,
    skipped: true,
  });
}
```

### Option 3: Different Bots for Different Content

```javascript
// Use different bots based on content type
const getBotToken = (typename) => {
  switch (typename) {
    case "Post":
      return "8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ";
    case "Comment":
      return "YOUR_COMMENTS_BOT_TOKEN";
    default:
      return "8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ";
  }
};
```

### Option 4: Add Custom Fields to Notifications

Modify the Hygraph webhook payload to include more fields:

```json
{
  "operation": "{{operation}}",
  "data": {
    "id": "{{id}}",
    "slug": "{{slug}}",
    "title": "{{title}}",
    "name": "{{name}}",
    "__typename": "{{__typename}}",
    "stage": "{{stage}}",
    "author": "{{author.name}}",
    "category": "{{category.name}}",
    "excerpt": "{{excerpt}}"
  }
}
```

Then update the message formatter to display these fields.

### Option 5: Add Buttons to Telegram Messages

```javascript
// Add inline keyboard with action buttons
body: JSON.stringify({
  chat_id: chatId,
  text: message,
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [[
      {
        text: '🌐 View Post',
        url: `https://blog.urtechy.com/post/${data.slug}`
      },
      {
        text: '✏️ Edit in CMS',
        url: `https://app.hygraph.com/project-id/content/${data.id}`
      }
    ]]
  }
}),
```

---

## 📊 Monitoring and Analytics

### View Webhook Performance

1. **In Hygraph:**

   - Settings → Webhooks → Your Webhook → Logs
   - Check response times and success rates

2. **In Vercel (if deployed there):**

   - Dashboard → Your Project → Functions
   - Check invocation counts and errors

3. **In Telegram:**
   - Keep track of notification patterns
   - Monitor for any missed or delayed notifications

### Set Up Alerts

Consider setting up monitoring for:

- Webhook failures (status codes != 200)
- Slow response times (> 5 seconds)
- High notification volume (potential spam)

---

## 🎉 Success Checklist

Before considering the integration complete, verify:

- [ ] Webhook endpoint is accessible from internet
- [ ] Environment variables are correctly set
- [ ] Webhook secret is configured in Hygraph
- [ ] All desired content types are selected
- [ ] All desired operations are enabled
- [ ] Test notifications received for each operation type
- [ ] Telegram messages are formatted correctly
- [ ] Post links work and redirect properly
- [ ] Webhook logs show successful deliveries
- [ ] No error messages in server logs

---

## 📚 Additional Resources

- **Hygraph Webhooks Documentation**: https://hygraph.com/docs/api-reference/basics/webhooks
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Your MCP Server**: `.mcp/README.md`

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Hygraph webhook logs
3. Check server logs: `vercel logs` or local console
4. Test the Telegram bot directly
5. Verify all environment variables

---

## 🎯 Quick Reference

### Webhook URL Template

```
https://YOUR_DOMAIN/api/hygraph-telegram-webhook?secret=YOUR_SECRET
```

### Test Command

```bash
curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"operation":"publish","data":{"id":"test","__typename":"Post","title":"Test"}}'
```

### Telegram Test

```bash
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Test"
```

---

**🎉 You're all set! Your Hygraph CMS will now send real-time notifications to Telegram for all content updates.**
