# 🚀 Hygraph ↔️ Telegram Webhook - Quick Reference

## 📋 Quick Setup Checklist

```bash
# 1. Environment variables are set ✅
HYGRAPH_WEBHOOK_SECRET=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
TELEGRAM_CHAT_ID=866021016

# 2. Telegram bot token (hardcoded in webhook file) ✅
8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ

# 3. Webhook file created ✅
/pages/api/hygraph-telegram-webhook.js

# 4. Test script created ✅
test-telegram-webhook.sh
```

---

## 🧪 Testing Commands

### Test Locally

```bash
# Start dev server
npm run dev

# Run test suite (in another terminal)
./test-telegram-webhook.sh

# Or test manually
curl -X POST "http://localhost:3000/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
  -H "Content-Type: application/json" \
  -d '{"operation":"publish","data":{"id":"test","slug":"test","title":"Test Post","__typename":"Post"}}'
```

### Test Production

```bash
./test-telegram-webhook.sh https://blog.urtechy.com
```

### Test Telegram Bot Directly

```bash
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Hello%20from%20webhook%20test"
```

---

## ⚙️ Hygraph Webhook Configuration

### Webhook URL

```
https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398
```

### Webhook Payload Template

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

### Operations to Enable

- ✅ Create
- ✅ Update
- ✅ Delete
- ✅ Publish
- ✅ Unpublish

### Models to Track

- ✅ Post
- ✅ Category
- ✅ Author
- ✅ Comment
- ✅ Asset
- ✅ (All other models)

### Stages

- ✅ DRAFT
- ✅ PUBLISHED

---

## 📱 Notification Examples

### Post Published

```
╔═══════════════════════════╗
║   🚀 URTECHY CMS UPDATE   ║
╚═══════════════════════════╝

🚀 Published - 📰 Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Title: My Blog Post
🔗 Slug: my-blog-post
🆔 ID: cm1abc123

🌐 View Post:
blog.urtechy.com/post/my-blog-post

⏰ Time: 20 Oct 2025, 2:30 PM
🔧 Environment: production
```

### Category Created

```
🆕 Created - 📁 Category
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Name: Technology
🔗 Slug: technology
🆔 ID: cm2def456
```

---

## 🔍 Troubleshooting

### Check Webhook Status

```bash
# View webhook logs in Hygraph
Settings → Webhooks → Telegram Notifications → Logs

# Check server logs (Vercel)
vercel logs

# Check local dev server
# Look at terminal where `npm run dev` is running
```

### Common Issues

| Issue                   | Solution                                         |
| ----------------------- | ------------------------------------------------ |
| 401 Unauthorized        | Check webhook secret in URL matches `.env.local` |
| 405 Method Not Allowed  | Ensure Hygraph uses POST method                  |
| 500 Server Error        | Check server logs, verify Telegram bot token     |
| No notifications        | Verify webhook is enabled in Hygraph             |
| Duplicate notifications | Check for multiple webhooks in Hygraph           |

### Test Individual Components

```bash
# 1. Test webhook endpoint is accessible
curl https://blog.urtechy.com/api/hygraph-telegram-webhook

# 2. Test with correct secret
curl -X POST "https://blog.urtechy.com/api/hygraph-telegram-webhook?secret=67020f02c7c393e08bd1a5a0554af5d2e836490765ffac7bf25cb2c6413d1398" \
  -H "Content-Type: application/json" \
  -d '{"operation":"publish","data":{"id":"test","__typename":"Post"}}'

# 3. Test Telegram bot
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/getMe"

# 4. Test sending to Telegram
curl "https://api.telegram.org/bot8225345387:AAHtSfgnn2bi0IvlPq2VH2S5k_bjuQPNIwQ/sendMessage?chat_id=866021016&text=Test"
```

---

## 📊 Event Types & Emojis

| Event     | Emoji | Content Types |
| --------- | ----- | ------------- |
| Create    | 🆕    | All models    |
| Update    | ✏️    | All models    |
| Delete    | 🗑️    | All models    |
| Publish   | 🚀    | All models    |
| Unpublish | 📦    | All models    |

| Content Type | Emoji |
| ------------ | ----- |
| Post         | 📰    |
| Category     | 📁    |
| Author       | 👤    |
| Comment      | 💬    |
| Asset        | 🖼️    |
| Other        | 📄    |

---

## 🎯 Next Steps

1. ✅ Run test script: `./test-telegram-webhook.sh`
2. ✅ Verify 5 Telegram notifications received
3. ✅ Deploy to production (if not already)
4. ✅ Configure webhook in Hygraph
5. ✅ Test with real content updates
6. ✅ Monitor webhook logs in Hygraph

---

## 📁 Files Created

```
/pages/api/hygraph-telegram-webhook.js    # Main webhook handler
/HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md        # Detailed setup guide
/test-telegram-webhook.sh                 # Test script
/HYGRAPH_TELEGRAM_WEBHOOK_QUICK_REF.md    # This file
```

---

## 🔗 Important Links

- **Hygraph Dashboard**: https://app.hygraph.com/cky5wgpym15ym01z44tk90zeb
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Your Blog**: https://blog.urtechy.com
- **Webhook Endpoint**: https://blog.urtechy.com/api/hygraph-telegram-webhook

---

## 💡 Pro Tips

1. **Test before deploying**: Always run `./test-telegram-webhook.sh` locally first
2. **Check logs regularly**: Monitor webhook logs in Hygraph for failures
3. **Use filters**: Modify webhook to only notify for important events
4. **Add buttons**: Enhance Telegram messages with inline buttons for quick actions
5. **Set up monitoring**: Track webhook performance and uptime

---

**📚 For detailed instructions, see `HYGRAPH_TELEGRAM_WEBHOOK_GUIDE.md`**
