# 🎯 Hygraph Webhook Configuration - Complete Guide

## ✅ Status: Code Updated & Working!

Your webhook handler has been updated to accept authentication via:
1. ✅ Query parameter: `?secret=...` 
2. ✅ Header: `x-hygraph-signature: ...`
3. ✅ Header: `gcms-signature: ...` (legacy)

---

## 🚀 Configure Webhook in Hygraph Dashboard

### Step 1: Login to Hygraph

Go to: [https://app.hygraph.com](https://app.hygraph.com)

Project ID: `cky5wgpym15ym01z44tk90zeb`

---

### Step 2: Navigate to Webhooks

1. Click **Settings** ⚙️ in the left sidebar
2. Click **Webhooks**
3. Click **+ Create Webhook** button

---

### Step 3: Basic Configuration

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `Telegram Notifications` |
| **Description** | `Real-time CMS notifications to Telegram` |
| **Include Payload** | ✅ **ON** (Must be enabled) |

---

### Step 4: Webhook URL

Choose **ONE** of these options:

#### Option A: Using Query Parameter (Recommended)
```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

#### Option B: Using Header Signature
```
URL: https://blog.urtechy.com/api/hygraph-telegram-webhook
Header Name: x-hygraph-signature
Header Value: 67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

**💡 Recommendation:** Use Option A (query parameter) as it's simpler and tested working!

---

### Step 5: HTTP Method

Select: **POST**

---

### Step 6: Content Type

Select: **application/json**

---

### Step 7: Webhook Triggers

Select what events should trigger notifications:

#### Models to Monitor:
- ✅ **Post** (Main content)
- ✅ **Category** (Content organization)
- ✅ **Author** (Author profiles)
- ✅ **Comment** (User comments)
- ✅ **Tag** (Post tags)
- ✅ **Asset** (Media files - optional)

#### Operations to Track:
- ✅ **Create** - New content created
- ✅ **Update** - Content modified
- ✅ **Delete** - Content deleted
- ✅ **Publish** - Content published
- ✅ **Unpublish** - Content unpublished

#### Stages:
- ✅ **DRAFT** - Draft changes
- ✅ **PUBLISHED** - Published changes

---

### Step 8: Advanced Settings (Optional)

**Custom Headers** (if using Option B):
```
Name: x-hygraph-signature
Value: 67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

**Timeout:** 30 seconds (default is fine)

**Retry:** 3 attempts (default is fine)

---

### Step 9: Save the Webhook

Click **Create Webhook** or **Save** button.

---

## 🧪 Test the Webhook

### Method 1: Test from Hygraph Dashboard

1. In the webhook settings, look for **"Test Webhook"** button
2. Click it
3. Select an event type (e.g., "Post Published")
4. Click **Send Test**
5. Check your Telegram! 📱

### Method 2: Real Content Test

1. Go to **Content** in Hygraph
2. Open any blog post
3. Make a small change (e.g., add a space in title)
4. Click **Save**
5. Click **Publish**
6. Check Telegram for notification! 🎉

### Method 3: Create New Post

1. **Content** → **Posts** → **+ Create**
2. Fill in:
   - Title: "Test Webhook Integration"
   - Slug: "test-webhook-integration"
   - Excerpt: "Testing Hygraph to Telegram notifications"
3. **Save** as draft (you'll get "Create" notification)
4. **Publish** (you'll get "Publish" notification)
5. Check Telegram for 2 notifications! 📱

---

## 📱 Expected Telegram Notifications

### When You Publish a Post:

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: Operation Summit of Fire: Why Israel Attacked Hamas in Qatar
🔗 Slug: israel-qatar-strike-hamas-operation-summit-fire
📄 Excerpt: In a shocking escalation, Israel targeted Hamas officials...
✍️ Author ID: clw60a2fi0e8w06o6a7056ex4
⭐ Featured: Yes
🏷️ Tags: 1
📊 Stage: PUBLISHED
🆔 ID: cmfcv4vqu0pk307oad82klwpl

🌐 View Post:
blog.urtechy.com/post/israel-qatar-strike-hamas-operation-summit-fire

⏰ Time: Oct 20, 2025, 3:30 PM
🔧 Environment: production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

### When You Create a Category:

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🆕 Created - 📁 Category
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Name: Technology
🔗 Slug: technology
🆔 ID: cm123abc456

⏰ Time: Oct 20, 2025, 3:35 PM
🔧 Environment: production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

---

## 🔍 Verify Webhook is Working

### Check Webhook Logs in Hygraph

1. **Settings** → **Webhooks** → Your Webhook
2. Click on **Logs** tab
3. You should see:
   - ✅ Status: **200 OK**
   - ✅ Response time: < 5 seconds
   - ✅ Response: `{"success":true,...}`

### Common Log Entries:

| Status | Meaning | Action |
|--------|---------|--------|
| **200 OK** | ✅ Success | Working perfectly! |
| **401 Unauthorized** | ❌ Wrong secret | Check secret matches |
| **405 Method Not Allowed** | ❌ Wrong method | Use POST |
| **500 Internal Error** | ❌ Server error | Check server logs |
| **Timeout** | ⏱️ Too slow | Check server response time |

---

## 🐛 Troubleshooting

### Problem: "Invalid webhook secret" Error

**Solutions:**

1. **Verify secret in Hygraph matches:**
   ```
   67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
   ```

2. **Check if using query param or header:**
   - Query param: Add `?secret=...` to URL
   - Header: Set `x-hygraph-signature` header

3. **Test locally first:**
   ```bash
   curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
     -H "Content-Type: application/json" \
     -d '{"operation":"publish","data":{"__typename":"Post","id":"test","title":"Test"}}'
   ```

### Problem: No Telegram Notification

**Check:**

1. ✅ Webhook is **enabled** in Hygraph (toggle switch ON)
2. ✅ Correct triggers are selected
3. ✅ Environment variables set in production:
   - `HYGRAPH_TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `HYGRAPH_WEBHOOK_SECRET`
4. ✅ Telegram bot token is valid
5. ✅ Chat ID is correct: `866021016`

**Test Telegram bot directly:**
```bash
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Test"
```

### Problem: Webhook Shows "Timeout"

**Solutions:**

1. Check your server is running and accessible
2. Verify URL is correct (no typos)
3. Check server logs for slow queries
4. Increase timeout in Hygraph settings (if available)

### Problem: Duplicate Notifications

**Solution:**

Check if you have multiple webhooks configured for the same events. Disable or delete duplicates.

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] Code deployed to production (Vercel/hosting)
- [ ] Environment variables added to production:
  - [ ] `HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ`
  - [ ] `TELEGRAM_CHAT_ID=866021016`
  - [ ] `HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398`
- [ ] Webhook created in Hygraph
- [ ] Correct webhook URL (production domain)
- [ ] All desired triggers selected
- [ ] Test webhook successful
- [ ] Real content change triggers notification
- [ ] Webhook logs show Status 200
- [ ] Telegram notifications received

---

## 📊 What Gets Notified

### Post Events:
- ✅ Create new draft → Get notification
- ✅ Update post → Get notification
- ✅ Publish post → Get notification with link
- ✅ Unpublish post → Get notification
- ✅ Delete post → Get notification

### Category Events:
- ✅ Create category → Get notification
- ✅ Update category → Get notification
- ✅ Delete category → Get notification

### Author Events:
- ✅ Create author → Get notification
- ✅ Update author → Get notification

### Tag Events:
- ✅ Create tag → Get notification
- ✅ Update tag → Get notification

### Comment Events:
- ✅ New comment → Get notification

---

## 🎨 Notification Features

### Rich Content Display:
- ✨ **Emojis** for visual identification
- 📊 **Structured layout** with sections
- 🔗 **Direct links** to published posts
- ⏰ **Timestamps** in IST timezone
- 🔧 **Environment** indicators (dev/prod)

### Post-Specific Info:
- Title, slug, excerpt
- Author information
- Featured status
- Category count
- Tag count
- Stage (DRAFT/PUBLISHED)

---

## 🚀 You're All Set!

Your Hygraph CMS is now ready to send real-time notifications to Telegram!

### Next Steps:

1. ✅ Create the webhook in Hygraph (use steps above)
2. ✅ Test with a real post publish
3. ✅ Enjoy instant CMS notifications! 🎉

**Questions?** Check the detailed guides:
- [`HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md`](HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md)
- [`README_HYGRAPH_TELEGRAM.md`](README_HYGRAPH_TELEGRAM.md)

---

**🎉 Happy content managing with real-time Telegram notifications!**
