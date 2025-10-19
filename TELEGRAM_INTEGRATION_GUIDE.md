# Telegram Bot Integration for Contact Form

## Overview
This integration sends you a Telegram notification whenever someone submits the contact form on your blog. You'll receive instant notifications with all the form details directly in your Telegram chat.

## Features
- ✅ Instant Telegram notifications for new contact form submissions
- ✅ Formatted messages with all contact details (name, email, phone, subject, message)
- ✅ Timestamps in IST timezone
- ✅ Secure API key management (server-side only)
- ✅ Non-blocking notification (form submission succeeds even if Telegram fails)
- ✅ Error handling and logging

## Architecture

### Components Created

1. **Environment Variables** (`.env.local`)
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `TELEGRAM_CHAT_ID`: Your Telegram chat ID

2. **Telegram Service** (`services/telegramService.js`)
   - Client-side service that calls the API route
   - Formats the message for Telegram
   - Handles errors gracefully

3. **API Route** (`pages/api/telegram-notify.js`)
   - Server-side endpoint that securely sends messages to Telegram
   - Protects API keys from client exposure
   - Validates incoming requests
   - Formats messages with Markdown

4. **Contact Form** (`pages/contact.jsx`)
   - Updated to call Telegram service after successful form submission
   - Non-blocking implementation (doesn't fail if Telegram notification fails)

## Setup Instructions

### 1. Environment Variables
The following variables have been added to your `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=7963846780:AAHkEiOryFhsreEvz04YdmrCi5PdizY9ljk
TELEGRAM_CHAT_ID=866021016
```

### 2. Bot Setup (Already Done)
Your bot is already configured with:
- **Bot Token**: 7963846780:AAHkEiOryFhsreEvz04YdmrCi5PdizY9ljk
- **Chat ID**: 866021016

To verify your bot:
1. Open Telegram and search for your bot
2. Send `/start` to activate it
3. The bot should be able to send you messages

### 3. Testing the Integration

#### Local Testing
```bash
# Start your development server
npm run dev

# Visit http://localhost:3000/contact
# Fill out and submit the form
# Check your Telegram chat for the notification
```

#### Manual API Testing
You can test the API route directly:

```bash
curl -X POST http://localhost:3000/api/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "subject": "Test",
    "message": "This is a test message"
  }'
```

## Notification Format

When someone submits the contact form, you'll receive a Telegram message like this:

```
🔔 New Contact Form Submission

👤 Name: John Doe
📧 Email: john@example.com
📱 Phone: +1234567890
📋 Subject: General Inquiry

💬 Message:
I would like to know more about your services.

⏰ Received: 19/10/2025, 10:30:45 AM
```

## How It Works

1. **User submits form** → Contact form validates and submits to Firebase
2. **Form submission succeeds** → Triggers Telegram notification
3. **Client calls API** → `/api/telegram-notify` endpoint is called
4. **Server sends to Telegram** → Bot API sends formatted message
5. **You get notified** → Telegram message appears in your chat

## Error Handling

### Non-Blocking Design
- If Telegram notification fails, the form submission still succeeds
- Firebase data is saved regardless of Telegram status
- User sees success message
- Errors are logged in development mode only

### Common Issues

#### Bot Not Sending Messages
1. Verify bot token is correct
2. Make sure you've started the bot in Telegram (`/start`)
3. Check that chat ID is correct
4. Ensure the bot is not blocked

#### API Errors
```javascript
// Check your server logs for details
// In development, errors are logged to console
```

## Security

### API Key Protection
- Bot token and chat ID are stored in `.env.local` (not committed to git)
- API keys are only accessible server-side
- Client-side code never sees the credentials
- API route validates all incoming requests

### Production Deployment

When deploying to production (Vercel, etc.):

1. **Add Environment Variables**
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

2. **Verify in Deployment Settings**
   - Go to your hosting platform's dashboard
   - Navigate to Environment Variables section
   - Add both variables
   - Redeploy your application

## Customization

### Message Format
Edit `pages/api/telegram-notify.js` to customize the message format:

```javascript
const formatContactMessage = (formData) => {
  // Customize your message format here
  let telegramMessage = `🔔 *New Contact Form Submission*\n\n`;
  // ... add your custom formatting
  return telegramMessage;
};
```

### Add More Fields
If you add fields to the contact form, update the message format:

```javascript
if (customField) {
  telegramMessage += `🎯 *Custom Field:* ${customField}\n`;
}
```

### Multiple Recipients
To send to multiple chats, modify the API route to loop through chat IDs:

```javascript
const chatIds = [process.env.TELEGRAM_CHAT_ID, process.env.TELEGRAM_CHAT_ID_2];
await Promise.all(chatIds.map(chatId => sendToTelegram(message, chatId)));
```

## Monitoring

### Development
- All errors are logged to console
- Check browser console for client-side errors
- Check terminal for server-side errors

### Production
- Errors are captured by Sentry (already configured)
- Check Sentry dashboard for Telegram notification errors
- Silent failures won't affect user experience

## Maintenance

### Testing Regularly
Create a test script to verify the integration:

```javascript
// test-telegram.js
const testTelegramNotification = async () => {
  const testData = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    message: "Testing Telegram integration"
  };
  
  const response = await fetch('http://localhost:3000/api/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  
  console.log(await response.json());
};

testTelegramNotification();
```

### Updating Bot Token
If you need to change the bot token:
1. Update `.env.local` locally
2. Update environment variables in your hosting platform
3. Redeploy the application

## Troubleshooting

### Issue: Not receiving notifications
**Solution**: 
1. Check that the bot is started (`/start` in Telegram)
2. Verify environment variables are set correctly
3. Check server logs for errors
4. Test the API route directly with curl

### Issue: Messages are garbled
**Solution**: 
- Telegram uses Markdown formatting
- Escape special characters: `*`, `_`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`

### Issue: Timeout errors
**Solution**:
- Check your internet connection
- Telegram API might be temporarily down
- Increase timeout in fetch request

## Files Modified/Created

### Created
- ✅ `services/telegramService.js` - Client-side Telegram service
- ✅ `pages/api/telegram-notify.js` - Server-side API endpoint
- ✅ `TELEGRAM_INTEGRATION_GUIDE.md` - This documentation

### Modified
- ✅ `.env.local` - Added Telegram environment variables
- ✅ `pages/contact.jsx` - Added Telegram notification call

## Support

For issues or questions:
1. Check this documentation first
2. Review the code comments in the created files
3. Test the API route directly
4. Check Sentry for production errors

## Next Steps

Consider these enhancements:
- [ ] Add emoji reactions based on form subject
- [ ] Send rich media (images, files) if applicable
- [ ] Create a Telegram bot command to view recent submissions
- [ ] Add analytics tracking for notification success rate
- [ ] Implement retry logic for failed notifications

---

**Integration Status**: ✅ Complete and Ready to Use

Test your integration by submitting the contact form and checking your Telegram chat!
