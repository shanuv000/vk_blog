# 🔐 Hygraph Telegram Webhook - New Secret Generated

## ✅ Problem Solved

The webhook now uses a **completely different secret** from your existing `HYGRAPH_WEBHOOK_SECRET` to avoid any conflicts.

## 🔑 Your Unique Secrets

### For Other Hygraph Webhooks
```bash
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### For Hygraph Telegram Integration (NEW - DIFFERENT VALUE)
```bash
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

## 📝 Complete Environment Variables for Telegram Integration

Add these **3 variables** to your environment:

```bash
# Telegram Bot Token (for Hygraph notifications)
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ

# Telegram Chat ID
TELEGRAM_CHAT_ID=866021016

# Webhook Secret (UNIQUE - different from HYGRAPH_WEBHOOK_SECRET)
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

## 🌐 Updated Webhook URL for Hygraph

Use this URL when configuring the webhook in Hygraph dashboard:

### Production URL
```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

### Local Testing URL
```
http://localhost:3000/api/hygraph-telegram-webhook?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

## 📋 Files Updated

✅ **`.env.local`** - Updated with new unique secret  
✅ **`test-hygraph-webhook.sh`** - Updated test script with new secret  
✅ **`HYGRAPH_TELEGRAM_NEW_SECRET.md`** - This documentation file

## 🧪 Quick Test (Local)

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Run Test Script
```bash
./test-hygraph-webhook.sh
```

### Step 3: Or Test Manually
```bash
curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "publish",
    "data": {
      "__typename": "Post",
      "id": "test-new-secret-001",
      "title": "✅ Testing New Unique Secret",
      "slug": "test-new-secret",
      "excerpt": "Verifying the new HYGRAPH_TELEGRAM_WEBHOOK_SECRET works",
      "featuredpost": true,
      "stage": "PUBLISHED"
    }
  }'
```

**Expected Result:**
- ✅ Status 200 OK
- ✅ JSON response: `{"success": true, "message": "Webhook processed..."}`
- ✅ Telegram notification received in chat `866021016`

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "Update Hygraph Telegram webhook with unique secret"
git push
```

### Step 2: Add Environment Variables to Vercel

1. Go to: [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **vk_blog**
3. Navigate to: **Settings** → **Environment Variables**
4. Add these **3 variables**:

| Variable Name | Value |
|---------------|-------|
| `HYGRAPH_TELEGRAM_BOT_TOKEN` | `8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ` |
| `TELEGRAM_CHAT_ID` | `866021016` |
| `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` | `940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a` |

5. Click **Save** after each variable
6. **Redeploy** your application

### Step 3: Configure Webhook in Hygraph Dashboard

1. Open: [Hygraph Dashboard](https://app.hygraph.com)
2. Select your project ID: `cky5wgpym15ym01z44tk90zeb`
3. Navigate to: **Settings** → **Webhooks**
4. Click: **"Create Webhook"**

#### Webhook Configuration:

| Field | Value |
|-------|-------|
| **Name** | `Telegram Notifications` |
| **URL** | `https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a` |
| **Method** | `POST` |
| **Content Type** | `application/json` |
| **Include Payload** | ✅ Yes |

#### Select Triggers:
- ✅ **Create** - New content created
- ✅ **Update** - Content updated
- ✅ **Delete** - Content deleted
- ✅ **Publish** - Content published
- ✅ **Unpublish** - Content unpublished

#### Select Models (or choose specific ones):
- ✅ **Post**
- ✅ **Category**
- ✅ **Author**
- ✅ **Comment**
- ✅ **Tag**

5. Click **"Save"**

### Step 4: Test in Production

1. In Hygraph dashboard, **publish** or **update** any post
2. Check your Telegram (Chat ID: `866021016`)
3. You should receive a notification! 🎉

## 🔍 Verification

### Check Environment Variable
```bash
cat .env.local | grep HYGRAPH_TELEGRAM_WEBHOOK_SECRET
```

**Expected Output:**
```
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

### Verify Secrets Are Different
```bash
cat .env.local | grep -E "HYGRAPH_WEBHOOK_SECRET|HYGRAPH_TELEGRAM_WEBHOOK_SECRET"
```

**Expected Output:**
```
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

✅ **Confirmed**: The two secrets are now **completely different**!

## 🎯 Why Different Secrets?

| Benefit | Description |
|---------|-------------|
| **No Conflicts** | Each webhook has its own authentication |
| **Better Security** | If one secret is compromised, others remain secure |
| **Clear Separation** | Easy to identify which integration is which |
| **Independent Management** | Can rotate secrets independently |
| **Easier Debugging** | Know exactly which webhook is being called |

## 📊 Secret Comparison

| Variable | Purpose | Value (first 10 chars) |
|----------|---------|------------------------|
| `HYGRAPH_WEBHOOK_SECRET` | Other Hygraph webhooks | `67020f02c7...` |
| `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` | Telegram notifications | `940c2009d8...` |

## 🆘 Troubleshooting

### Getting 401 errors?

**Check these:**
1. ✅ `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` is set in `.env.local` (local) or Vercel (production)
2. ✅ Webhook URL in Hygraph includes correct secret: `?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a`
3. ✅ Dev server was restarted after changing `.env.local`
4. ✅ Application was redeployed after adding Vercel environment variables

### Not receiving Telegram notifications?

**Verify:**
1. ✅ `HYGRAPH_TELEGRAM_BOT_TOKEN` is correct
2. ✅ `TELEGRAM_CHAT_ID` is correct (866021016)
3. ✅ Test bot directly: Send `/start` to your bot on Telegram
4. ✅ Check webhook is triggering: Look at Hygraph webhook logs

### Test webhook locally first:

```bash
# 1. Start dev server
npm run dev

# 2. Run test
./test-hygraph-webhook.sh

# 3. Check Telegram for notification
```

## 📱 What Notifications Look Like

When you publish/update content in Hygraph, you'll receive:

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: Your Post Title
🔗 Slug: your-post-slug
📄 Excerpt: Post excerpt text...
⭐ Featured: Yes
✍️ Author ID: author-123
🏷️ Tags: 3
📁 Categories: 2
📊 Stage: PUBLISHED

🆔 ID: your-post-id

🌐 View Post:
blog.urtechy.com/post/your-post-slug

⏰ Time: Oct 20, 2025, 10:30 AM
🔧 Environment: production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

## ✨ Summary

✅ **New unique secret generated**: `940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a`  
✅ **Different from existing secret**: No conflicts with `HYGRAPH_WEBHOOK_SECRET`  
✅ **Files updated**: `.env.local` and test script  
✅ **Ready to deploy**: Just follow the 4 steps above  
✅ **Secure separation**: Each webhook has independent authentication  

## 🎉 You're Ready!

1. **Test locally** (optional but recommended)
2. **Deploy to production** (git push)
3. **Add Vercel environment variables** (3 variables)
4. **Configure Hygraph webhook** (use new URL with new secret)
5. **Start receiving notifications!** 🚀

---

**Need help?** All documentation files have been updated with the new secret values.

**Security Note:** Keep this secret confidential! It authenticates webhook requests from Hygraph to your application.
