# 🔄 TinyURL Webhook Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HYGRAPH TINYURL WEBHOOK FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

1. CONTENT CREATION
┌─────────────────┐
│  Content Editor │
│   writes post   │
└─────────────────┘
         │
         │ Creates/Updates/Publishes
         ▼
┌─────────────────┐
│   Hygraph CMS   │
│  (Post Model)   │
└─────────────────┘
         │
         │ Triggers Webhook
         ▼

2. WEBHOOK TRIGGER
┌─────────────────┐    POST Request with:
│  Hygraph        │    • operation: "publish"
│  Webhook        │────• data.slug: "my-awesome-post"
│  System         │    • data.title: "My Awesome Post"
└─────────────────┘    • data.__typename: "Post"
         │
         │ HTTPS Request
         ▼
┌─────────────────┐
│ blog.urtechy.   │    URL: /api/tinyurl-webhook?secret=***
│ com/api/        │    Method: POST
│ tinyurl-webhook │    Headers: Content-Type: application/json
└─────────────────┘
         │
         │ Validates & Processes
         ▼

3. URL SHORTENING
┌─────────────────┐
│   Next.js API   │    1. Validates webhook secret
│   Handler       │    2. Checks operation type (publish/update)
│                 │    3. Verifies Post model type
└─────────────────┘    4. Extracts slug & title
         │
         │ Calls TinyURL Service
         ▼
┌─────────────────┐
│  TinyURL        │    Creates shortened URL:
│  Service        │    FROM: https://blog.urtechy.com/post/my-awesome-post
│                 │    TO:   https://tinyurl.com/urtechy-my-awesome-post
└─────────────────┘
         │
         │ Returns short URL
         ▼
┌─────────────────┐
│   TinyURL       │    • Stores URL mapping
│   API Server    │    • Provides analytics
│                 │    • Returns success response
└─────────────────┘
         │
         │ Success Response
         ▼

4. RESPONSE & LOGGING
┌─────────────────┐
│  Webhook        │    Returns JSON:
│  Response       │    {
│                 │      "success": true,
│                 │      "shortUrl": "https://tinyurl.com/urtechy-...",
└─────────────────┘      "longUrl": "https://blog.urtechy.com/post/..."
         │                }
         │ Logs Activity
         ▼
┌─────────────────┐
│  Vercel/        │    Console Logs:
│  Server Logs    │    ✅ TinyURL Webhook received: publish for Post
│                 │    ✅ Successfully created short URL: https://...
└─────────────────┘

5. IMMEDIATE USAGE
┌─────────────────┐
│  Website        │    When users visit post:
│  Visitor        │    • useTinyUrl hook loads short URL
│                 │    • Social sharing uses short URL
└─────────────────┘    • Copy links use short URL
         │
         │ Shares using short URL
         ▼
┌─────────────────┐
│  Social Media   │    Shared links:
│  Platforms      │    🐦 Twitter: "Check out: https://tinyurl.com/urtechy-..."
│                 │    📘 Facebook: "https://tinyurl.com/urtechy-..."
└─────────────────┘    💼 LinkedIn: "https://tinyurl.com/urtechy-..."


TIMING BREAKDOWN:
════════════════
Post Published ────→ Webhook Fired ────→ URL Shortened ────→ Available for Sharing
     │                    │                    │                      │
     0s                  ~1s                  ~3s                    ~5s
     
Total time from publish to shortened URL: ~5 seconds
```

## 🔧 Configuration Details

### Hygraph Webhook Settings
```yaml
Name: TinyURL Auto-Shortening
URL: https://blog.urtechy.com/api/tinyurl-webhook?secret=YOUR_SECRET
Method: POST
Content-Type: application/json

Triggers:
  - Model: Post
  - Operations: Create, Update, Publish
  
Payload:
{
  "operation": "{{operation}}",
  "data": {
    "id": "{{id}}",
    "slug": "{{slug}}",
    "title": "{{title}}",
    "__typename": "{{__typename}}",
    "stage": "{{stage}}"
  }
}
```

### TinyURL URL Pattern
```
Original URL: https://blog.urtechy.com/post/react-19-new-features-guide
Short URL:    https://tinyurl.com/urtechy-react-19-new-features

Pattern:      https://tinyurl.com/urtechy-{slug-truncated-to-30-chars}
```

### Error Handling Flow
```
Webhook Received ──→ Validate Secret ──→ Check Model Type ──→ Create Short URL
       │                    │                   │                    │
       │                    ▼                   ▼                    ▼
       │              [401 Invalid]      [200 Skipped]        [TinyURL API]
       │                                                              │
       ▼                                                              ▼
[405 Method Not Allowed]                                    [Success] or [Fallback]
                                                                      │
                                                                      ▼
                                                            [200 with shortUrl or error]
```

## 📊 Monitoring Points

### 1. Hygraph Dashboard
- ✅ Webhook execution logs
- ✅ Success/failure rates  
- ✅ Response times

### 2. Vercel/Server Logs
- ✅ Webhook received events
- ✅ TinyURL API responses
- ✅ Error messages and stack traces

### 3. TinyURL Dashboard
- ✅ New URLs created
- ✅ Click analytics
- ✅ API usage statistics

## 🚨 Common Issues & Solutions

### Issue: Webhook Not Firing
```bash
Check: Hygraph webhook configuration
Verify: Webhook is enabled and URL is correct
Test: Use webhook test script: ./test-tinyurl-webhook.sh production
```

### Issue: 401 Invalid Token
```bash
Check: HYGRAPH_WEBHOOK_SECRET in environment
Verify: Secret matches in webhook URL
Action: Redeploy after environment changes
```

### Issue: URLs Not Shortening
```bash
Check: TINYURL_API_KEY configuration
Test: TinyURL service directly via /tinyurl-demo
Debug: Check server logs for TinyURL API errors
```

## 🎯 Success Indicators

✅ **Webhook Health**: All webhook calls return 200 status
✅ **URL Creation**: New posts get short URLs within 5 seconds
✅ **Social Sharing**: Share buttons use shortened URLs
✅ **Analytics**: Click data appears in TinyURL dashboard
✅ **Zero Errors**: No 401, 500, or timeout errors in logs

---

This flow ensures that every blog post automatically gets a professional shortened URL for enhanced social sharing! 🚀