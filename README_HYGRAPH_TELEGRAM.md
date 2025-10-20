# 🔔 Hygraph to Telegram Webhook Integration

> Get instant Telegram notifications for all Hygraph CMS changes!

---

## 🎯 Quick Start

**Already set up! Just follow these 3 steps:**

### 1. Test Locally

```bash
./test-simple.sh
```

✅ You should receive a Telegram notification

### 2. Deploy to Production

```bash
git add .
git commit -m "Add Hygraph Telegram webhook"
git push origin main
```

### 3. Configure in Hygraph

- Login to [Hygraph](https://app.hygraph.com)
- Go to **Settings** → **Webhooks** → **Create**
- Use the webhook URL from `HYGRAPH_TELEGRAM_INTEGRATION_SUMMARY.md`
- Enable ALL triggers and models
- Save

---

## 📚 Documentation

| Document                                                                               | Purpose            | When to Use        |
| -------------------------------------------------------------------------------------- | ------------------ | ------------------ |
| **[HYGRAPH_TELEGRAM_QUICK_START.md](HYGRAPH_TELEGRAM_QUICK_START.md)**                 | ⭐ **START HERE**  | Quick overview     |
| **[HYGRAPH_TELEGRAM_INTEGRATION_SUMMARY.md](HYGRAPH_TELEGRAM_INTEGRATION_SUMMARY.md)** | Complete summary   | Full details       |
| **[HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md](HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md)**             | Step-by-step guide | Setup help         |
| **[HYGRAPH_TELEGRAM_WEBHOOK_QUICK_REF.md](HYGRAPH_TELEGRAM_WEBHOOK_QUICK_REF.md)**     | Quick reference    | Commands & configs |
| **[HYGRAPH_TELEGRAM_FLOW_DIAGRAM.md](HYGRAPH_TELEGRAM_FLOW_DIAGRAM.md)**               | Visual flow        | Understanding      |

---

## 🚀 What You Get

- ✅ **Instant notifications** (~2 seconds)
- ✅ **All content types** (Post, Category, Author, Comment, etc.)
- ✅ **All operations** (Create, Update, Delete, Publish, Unpublish)
- ✅ **Rich formatting** (Emojis, styled text, links)
- ✅ **Direct links** to published posts
- ✅ **Secure** (Webhook secret validation)

---

## 📱 Example Notification

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post

📌 Title: My Blog Post
🔗 Slug: my-blog-post
🆔 ID: cm1abc123

🌐 View Post:
blog.urtechy.com/post/my-blog-post

⏰ Time: 20 Oct 2025, 2:30 PM
🔧 Environment: production
```

---

## 🔧 Configuration

### Bot Details

- **Token**: `8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ`
- **Chat ID**: `866021016`

### Environment Variables

```bash
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
TELEGRAM_CHAT_ID=866021016
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
```

### Webhook Endpoint

```
Production: https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
Local: http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

---

## 🧪 Testing

```bash
# Quick test (1 notification)
./test-simple.sh

# Full test suite (7 notifications)
./test-telegram-webhook.sh

# Test bot directly
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Test"
```

---

## 📂 Files Created

```
/pages/api/hygraph-telegram-webhook.js    ← Main webhook handler
HYGRAPH_TELEGRAM_QUICK_START.md           ← Quick overview
HYGRAPH_TELEGRAM_INTEGRATION_SUMMARY.md   ← Complete summary
HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md         ← Detailed guide
HYGRAPH_TELEGRAM_WEBHOOK_QUICK_REF.md     ← Quick reference
HYGRAPH_TELEGRAM_FLOW_DIAGRAM.md          ← Visual diagrams
HYGRAPH_TELEGRAM_SETUP_COMPLETE.md        ← Setup checklist
test-telegram-webhook.sh                  ← Full test suite
test-simple.sh                            ← Quick test
README_HYGRAPH_TELEGRAM.md                ← This file
```

---

## ✅ Verification Checklist

- [ ] Test script runs successfully
- [ ] Telegram notification received
- [ ] Changes deployed to production
- [ ] Webhook configured in Hygraph
- [ ] Real content update triggers notification
- [ ] Webhook logs show success

---

## 🔍 Troubleshooting

| Problem                | Solution                              |
| ---------------------- | ------------------------------------- |
| No notification        | Check Hygraph webhook logs for errors |
| 401 Unauthorized       | Verify webhook secret matches         |
| 405 Method Not Allowed | Ensure Hygraph uses POST              |
| Missing links          | Add slug to webhook payload           |

For detailed troubleshooting, see `HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md`.

---

## 🎨 Notification Types

| Operation | Emoji | Content Type | Emoji |
| --------- | ----- | ------------ | ----- |
| Create    | 🆕    | Post         | 📰    |
| Update    | ✏️    | Category     | 📁    |
| Delete    | 🗑️    | Author       | 👤    |
| Publish   | 🚀    | Comment      | 💬    |
| Unpublish | 📦    | Asset        | 🖼️    |

---

## 💡 Key Features

- **Speed**: Notifications arrive in ~2 seconds
- **Coverage**: All Hygraph models and operations
- **Security**: Webhook secret + HTTPS
- **Formatting**: Beautiful Markdown with emojis
- **Links**: Direct access to published content
- **Environment**: Shows dev/production

---

## 🎉 Success!

You're all set! Your Hygraph CMS will now send instant Telegram notifications for all content changes.

**Next Steps:**

1. Test locally with `./test-simple.sh`
2. Deploy to production
3. Configure webhook in Hygraph
4. Start receiving notifications!

---

**Questions? Check the comprehensive guides in the documentation files above!**
