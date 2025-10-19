# Telegram Bot Quick Reference

## 🚀 Quick Start

### Environment Variables (Already Set)
```bash
TELEGRAM_BOT_TOKEN=7963846780:AAHkEiOryFhsreEvz04YdmrCi5PdizY9ljk
TELEGRAM_CHAT_ID=866021016
```

## 📱 Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Test Script
```bash
./test-telegram-integration.sh
```

### 3. Test via Contact Form
- Visit: http://localhost:3000/contact
- Fill out the form
- Submit
- Check Telegram for notification

## 🎯 What You'll Receive

Every form submission sends you a Telegram message with:
- 👤 Full name
- 📧 Email address  
- 📱 Phone number (if provided)
- 📋 Subject (if selected)
- 💬 Message content
- ⏰ Timestamp (IST timezone)

## 🔧 Files Created

```
services/
  └── telegramService.js          # Client-side service

pages/api/
  └── telegram-notify.js          # Server-side API endpoint

pages/
  └── contact.jsx                 # Updated contact form

.env.local                        # Updated with Telegram keys

test-telegram-integration.sh     # Test script
```

## ⚙️ Configuration

### Change Chat ID (to send to different person/group)
```bash
# In .env.local
TELEGRAM_CHAT_ID=your_new_chat_id
```

### Get Your Chat ID
1. Message your bot in Telegram
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for "chat":{"id": YOUR_CHAT_ID}

### Multiple Recipients
Edit `pages/api/telegram-notify.js`:
```javascript
// Send to multiple chat IDs
const chatIds = [process.env.TELEGRAM_CHAT_ID, process.env.TELEGRAM_CHAT_ID_2];
for (const chatId of chatIds) {
  await sendToTelegram(message, chatId);
}
```

## 🐛 Troubleshooting

### Not receiving messages?
```bash
# 1. Check bot is started
# Open Telegram → Find your bot → Send: /start

# 2. Verify environment variables
cat .env.local | grep TELEGRAM

# 3. Test the API directly
curl -X POST http://localhost:3000/api/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","message":"test"}'

# 4. Check server logs
# Look at your terminal running npm run dev
```

### Common Issues
| Issue | Solution |
|-------|----------|
| "Method not allowed" | Only POST requests are accepted |
| "Missing required fields" | Ensure firstName, lastName, email, message are provided |
| "Telegram API error" | Check bot token and chat ID |
| Bot not responding | Send /start to your bot in Telegram |

## 📦 Production Deployment

### Vercel
1. Go to Project Settings → Environment Variables
2. Add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Redeploy

### Other Platforms
Add the same environment variables in your platform's dashboard.

## 🔐 Security Notes

✅ **What's Secure:**
- API keys only on server
- Client never sees tokens
- Requests validated server-side

❌ **Never Do:**
- Commit .env.local to git
- Expose tokens in client code
- Share bot token publicly

## 📊 Monitoring

### Development
- Check terminal for logs
- All errors logged to console

### Production
- Errors tracked by Sentry (already configured)
- Check Sentry dashboard for issues

## 🎨 Customization

### Change Message Format
Edit `pages/api/telegram-notify.js`:
```javascript
const formatContactMessage = (formData) => {
  let message = `🔔 *New Message!*\n\n`;
  // Add your custom format here
  return message;
};
```

### Add Buttons/Links
```javascript
// In sendToTelegram function
reply_markup: {
  inline_keyboard: [[
    {text: "View in Dashboard", url: "https://yourdomain.com/admin"}
  ]]
}
```

## 📝 API Endpoint

**URL:** `/api/telegram-notify`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "subject": "string (optional)",
  "message": "string (required)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Telegram notification sent successfully",
  "telegramResponse": { /* Telegram API response */ }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error (dev only)"
}
```

## 🔗 Useful Links

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Creating a Telegram Bot](https://core.telegram.org/bots#creating-a-new-bot)
- [Formatting Options](https://core.telegram.org/bots/api#formatting-options)

## ✅ Checklist

- [x] Environment variables added
- [x] API route created
- [x] Service created
- [x] Contact form updated
- [x] Test script created
- [x] Documentation written

## 🎉 You're All Set!

Your contact form now sends Telegram notifications. Test it and start receiving messages!

---

**Need Help?** Check `TELEGRAM_INTEGRATION_GUIDE.md` for detailed information.
