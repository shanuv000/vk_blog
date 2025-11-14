# 🎯 Hygraph Telegram Webhook - Quick Start

## ✅ What's Configured

Your Hygraph to Telegram webhook integration is **ready to deploy**!

## 🔑 Environment Variables

Add these **3 variables** to your environment:

```bash
# Telegram Bot for Hygraph notifications
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ

# Telegram Chat ID (where notifications are sent)
TELEGRAM_CHAT_ID=866021016

# Webhook secret for authentication (unique name to avoid conflicts)
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### ⚠️ Important Note

We use `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` (not `HYGRAPH_WEBHOOK_SECRET`) to avoid conflicts with your existing Hygraph webhook configuration.

## 🚀 Deployment Steps

### 1️⃣ Commit & Push (Already Done ✅)

```bash
git add .
git commit -m "Add Hygraph Telegram webhook integration"
git push
```

### 2️⃣ Configure Vercel Environment Variables

1. Go to: [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **vk_blog**
3. Navigate to: **Settings** → **Environment Variables**
4. Add these **3 variables** (copy-paste from above)
5. Click **Save** after each variable
6. **Redeploy** your application

### 3️⃣ Configure Webhook in Hygraph

1. Open: [Hygraph Dashboard](https://app.hygraph.com)
2. Select your project: `cky5wgpym15ym01z44tk90zeb`
3. Go to: **Settings** → **Webhooks**
4. Click: **"Create Webhook"**
5. Configure:
   - **Name**: `Telegram Notifications`
   - **URL**: `https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398`
   - **Method**: `POST`
   - **Content Type**: `application/json`
   - **Include Payload**: ✅ Yes
6. Select **Triggers**:
   - ✅ Create
   - ✅ Update
   - ✅ Delete
   - ✅ Publish
   - ✅ Unpublish
7. Select **Models** (or select specific ones):
   - ✅ Post
   - ✅ Category
   - ✅ Author
   - ✅ Comment
   - ✅ Tag
8. Click **"Save"**

### 4️⃣ Test It!

1. In Hygraph, **publish** or **update** any post
2. Check your Telegram (Chat ID: `866021016`)
3. You should receive a notification like:

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: Your Post Title
🔗 Slug: your-post-slug
📄 Excerpt: Post excerpt...
⭐ Featured: Yes
🏷️ Tags: 3
📁 Categories: 2

🆔 ID: your-post-id

🌐 View Post:
blog.urtechy.com/post/your-post-slug

⏰ Time: Jan 20, 2025, 10:30 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

## 🧪 Local Testing (Optional)

### Before deploying, test locally:

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Run test:**

   ```bash
   ./test-hygraph-webhook.sh
   ```

   Or manually:

   ```bash
   curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
     -H "Content-Type: application/json" \
     -d '{"operation":"publish","data":{"__typename":"Post","id":"test-123","title":"Test Post","slug":"test-post"}}'
   ```

3. **Check Telegram** for notification

## 📱 What Events Trigger Notifications?

| Event         | Emoji | Description                             |
| ------------- | ----- | --------------------------------------- |
| **Create**    | 🆕    | New content created (draft)             |
| **Update**    | ✏️    | Content modified                        |
| **Publish**   | 🚀    | Content published (goes live)           |
| **Unpublish** | 📦    | Content unpublished (removed from live) |
| **Delete**    | 🗑️    | Content deleted                         |

## 🎨 Content Types Tracked

| Type         | Emoji | What's Tracked                                                  |
| ------------ | ----- | --------------------------------------------------------------- |
| **Post**     | 📰    | Title, slug, excerpt, author, featured status, tags, categories |
| **Category** | 📁    | Name, slug                                                      |
| **Author**   | 👤    | Name, details                                                   |
| **Comment**  | 💬    | Comment details                                                 |
| **Tag**      | 🏷️    | Tag name                                                        |
| **Asset**    | 🖼️    | Media files                                                     |

## 🔒 Security Features

✅ **Webhook secret validation** - Only authenticated requests accepted  
✅ **Environment variables** - Credentials never in code  
✅ **Dual authentication** - Query param OR header-based  
✅ **Error logging** - Track failed attempts

## 📚 Detailed Documentation

- **`HYGRAPH_TELEGRAM_ENV_UPDATE.md`** - Environment variable details
- **`HYGRAPH_WEBHOOK_SETUP.md`** - Complete configuration guide
- **`README_HYGRAPH_TELEGRAM.md`** - Full integration documentation
- **`test-hygraph-webhook.sh`** - Test script

## 🆘 Troubleshooting

### Not receiving notifications?

1. **Check environment variables** in Vercel
2. **Verify webhook URL** in Hygraph matches exactly
3. **Check webhook secret** matches in both places
4. **Test locally first** to isolate issues
5. **Check Vercel logs** for errors

### Getting 401 errors?

- Verify `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` is set correctly
- Check webhook URL includes `?secret=...` parameter
- Ensure secret matches in `.env.local` and Hygraph webhook URL

### Telegram bot not responding?

- Verify `HYGRAPH_TELEGRAM_BOT_TOKEN` is correct
- Check `TELEGRAM_CHAT_ID` is correct
- Test bot directly: Send `/start` to your bot

## ✨ You're All Set!

Just complete steps 2️⃣ and 3️⃣ above, and you'll start receiving real-time Telegram notifications for all your Hygraph CMS changes! 🎉

---

**Need help?** Check the detailed documentation files listed above.
