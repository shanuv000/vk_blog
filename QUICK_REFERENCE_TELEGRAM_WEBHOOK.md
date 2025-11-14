# 🎯 Hygraph Telegram Webhook - Quick Reference Card

## ✅ Current Status: TESTED & WORKING!

**Test Result:** Message ID 11 sent successfully to Telegram ✅

---

## 🔑 Your Unique Webhook Secret

```
940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

⚠️ **Different from `HYGRAPH_WEBHOOK_SECRET`** - No conflicts!

---

## 📦 Environment Variables (Add to Vercel)

```bash
HYGRAPH_TELEGRAM_BOT_TOKEN=8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ
TELEGRAM_CHAT_ID=866021016
HYGRAPH_TELEGRAM_WEBHOOK_SECRET=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

---

## 🌐 Webhook URL (For Hygraph Dashboard)

```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=940c2009d8fad8c5a430bda62809878cbd42f17236d78b0b26cb9274d4acbb0a
```

---

## 🚀 3 Steps to Deploy

### 1️⃣ Push to Production
```bash
git add .
git commit -m "Add Hygraph Telegram webhook with unique secret"
git push
```

### 2️⃣ Add to Vercel
- Dashboard → Settings → Environment Variables
- Add 3 variables (from above)
- Redeploy

### 3️⃣ Configure Hygraph
- https://app.hygraph.com → Project `cky5wgpym15ym01z44tk90zeb`
- Settings → Webhooks → Create Webhook
- URL: (from above)
- Triggers: All (Create, Update, Delete, Publish, Unpublish)
- Models: All or specific

---

## 📱 You'll Receive

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post

📌 Title: Your Post Title
🔗 Slug: your-post-slug
📄 Excerpt: Post excerpt...
⭐ Featured: Yes

🆔 ID: post-id

🌐 View Post: blog.urtechy.com/post/slug

⏰ Time: Oct 20, 2025, 10:30 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Hygraph CMS Notification ✨
```

---

## 🎉 That's It!

Deploy → Configure → Receive Notifications! 🚀

**Full Guide:** `HYGRAPH_TELEGRAM_FINAL_SETUP.md`
