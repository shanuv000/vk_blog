# 🔄 Environment Variable Update - Hygraph Telegram Webhook

## ⚠️ Important Change

To avoid confusion with the existing `HYGRAPH_WEBHOOK_SECRET` variable, we now use a **dedicated environment variable** for the Telegram webhook integration.

## 📝 Updated Variable Names

### Old Configuration (DO NOT USE)

```bash
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### ✅ New Configuration (USE THIS)

```bash
# Webhook secret for Hygraph (used by other webhooks)
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398

# Webhook secret for Hygraph Telegram integration (specific to Telegram notifications)
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

## 🔑 Complete Environment Variables

Add these to your `.env.local` file:

```bash
# Telegram Bot for Hygraph Webhook (for CMS notifications)
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
TELEGRAM_CHAT_ID=866021016

# Webhook secret for Hygraph Telegram integration
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

## 🚀 Updated Webhook URL

### For Hygraph Dashboard Configuration

Use this URL when setting up the webhook in Hygraph:

```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### For Local Testing

```bash
http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

## 📋 Deployment Checklist

### ✅ Updated Files

- [x] `.env.local` - Added `HYGRAPH_TELEGRAM_WEBHOOK_SECRET`
- [x] `/pages/api/hygraph-telegram-webhook.js` - Now uses `process.env.HYGRAPH_TELEGRAM_WEBHOOK_SECRET`
- [x] Documentation updated

### 🔧 Vercel Configuration

When deploying to production, add these environment variables to Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add these **THREE** variables:

| Variable Name                     | Value                                                              |
| --------------------------------- | ------------------------------------------------------------------ |
| `HYGRAPH_TELEGRAM_BOT_TOKEN`      | `8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ`                   |
| `TELEGRAM_CHAT_ID`                | `866021016`                                                        |
| `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` | `67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398` |

5. Click **Save**
6. **Redeploy** your application

## 🧪 Testing

### Test Locally (After restart)

1. **Restart your dev server:**

   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Run the test:**

   ```bash
   curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
     -H "Content-Type: application/json" \
     -d '{
       "operation": "publish",
       "data": {
         "__typename": "Post",
         "id": "test-new-secret",
         "title": "✅ Testing New Environment Variable",
         "slug": "test-new-secret",
         "excerpt": "Verifying HYGRAPH_TELEGRAM_WEBHOOK_SECRET works correctly",
         "featuredpost": true
       }
     }'
   ```

3. **Expected Result:**
   - ✅ Status 200
   - ✅ JSON response with `success: true`
   - ✅ Telegram notification received in chat `866021016`

## 🎯 Why This Change?

### Problem

- `HYGRAPH_WEBHOOK_SECRET` was already in use for other Hygraph webhooks
- Using the same variable for multiple purposes causes confusion
- Hard to manage different webhook integrations

### Solution

- **Dedicated variable**: `HYGRAPH_TELEGRAM_WEBHOOK_SECRET`
- **Clear purpose**: Specifically for Telegram notifications
- **Better organization**: Each integration has its own secret
- **Easier maintenance**: No conflicts with other webhooks

## 📊 Variable Usage Overview

| Variable                          | Purpose                       | Used By                         |
| --------------------------------- | ----------------------------- | ------------------------------- |
| `HYGRAPH_WEBHOOK_SECRET`          | General Hygraph webhooks      | Other webhook handlers          |
| `HYGRAPH_TELEGRAM_WEBHOOK_SECRET` | Telegram notifications        | `/api/hygraph-telegram-webhook` |
| `HYGRAPH_TELEGRAM_BOT_TOKEN`      | Telegram bot authentication   | Telegram API calls              |
| `TELEGRAM_CHAT_ID`                | Target chat for notifications | Telegram message destination    |

## 🔍 Verification Commands

### Check Environment Variables

```bash
# Check if all required variables are set
cat .env.local | grep -E "HYGRAPH_TELEGRAM_WEBHOOK_SECRET|TELEGRAM_CHAT_ID|HYGRAPH_TELEGRAM_BOT_TOKEN"
```

**Expected Output:**

```bash
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
TELEGRAM_CHAT_ID=866021016
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### Verify Webhook Code

```bash
# Check if webhook handler uses the correct variable
grep "HYGRAPH_TELEGRAM_WEBHOOK_SECRET" pages/api/hygraph-telegram-webhook.js
```

**Expected Output:**

```javascript
const expectedSecret = process.env.HYGRAPH_TELEGRAM_WEBHOOK_SECRET;
```

## 🎉 What's Next?

1. ✅ **Environment variable updated** - Using `HYGRAPH_TELEGRAM_WEBHOOK_SECRET`
2. ✅ **Code updated** - Webhook handler using new variable
3. 🔄 **Restart dev server** - Apply changes locally
4. 🧪 **Test webhook** - Verify it works with new variable
5. 🚀 **Deploy to production** - Push changes to Vercel
6. ⚙️ **Add Vercel env vars** - Configure production environment
7. 🎯 **Configure Hygraph webhook** - Set up in CMS dashboard
8. ✨ **Start receiving notifications** - Enjoy real-time updates!

## 📚 Related Documentation

- `HYGRAPH_WEBHOOK_SETUP.md` - Complete Hygraph dashboard configuration
- `README_HYGRAPH_TELEGRAM.md` - Main integration guide
- `HYGRAPH_TELEGRAM_QUICK_START.md` - Quick reference

---

**✨ Update Complete!**
The webhook now uses a dedicated environment variable for better organization and clarity.
