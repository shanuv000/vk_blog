# Dub.co Link Shortener Setup Guide

Complete setup guide for integrating Dub.co with your blog for link shortening.

## 1. Create Dub.co Account

1. Go to [https://app.dub.co/register](https://app.dub.co/register)
2. Sign up with email or Google/GitHub
3. Create a workspace (e.g., "URTechy Blog")

## 2. Get API Key

1. Go to **Dashboard → Settings → API Keys**
2. Click **Create API Key**
3. Name it "Blog Link Shortener"
4. Copy the key (starts with `dub_`)

## 3. Add Custom Domain (Optional)

### In Dub.co Dashboard:
1. Go to **Domains → Add Domain**
2. Enter your subdomain: `u.urtechy.com`
3. Note the DNS records shown

### In Your DNS Provider (e.g., Cloudflare):
Add this record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `u` | `cname.dub.co` | Auto |

> **Note:** DNS propagation can take up to 24 hours.

### Verify in Dub.co:
1. Return to Dub.co Dashboard → Domains
2. Click **Verify** next to your domain
3. Wait for green checkmark ✅

### Set as Default:
1. Click the three dots (...) next to your domain
2. Select **Set as Primary**

## 4. Update Environment Variables

Add to `.env.local`:

```bash
# Dub.co Configuration
DUB_API_KEY=dub_xxxxxxxxxxxxxxxxxxxxxx
DUB_CUSTOM_DOMAIN=u.urtechy.com
```

## 5. Add Hygraph Schema Field

In Hygraph Dashboard:

1. Go to **Schema → Post** model
2. Click **Add Field → Single line text**
3. Configure:
   - **Display name:** Short URL
   - **API ID:** `shortUrl`
   - **Description:** Dub.co shortened URL for sharing
4. Click **Create**
5. **Publish the schema changes**

## 6. Configure Hygraph Webhook

In Hygraph Dashboard → Settings → Webhooks:

1. Click **Create Webhook**
2. Fill in:

| Field | Value |
|-------|-------|
| **Name** | Dub.co Link Shortener |
| **URL** | `https://blog.urtechy.com/api/dub-webhook?secret=YOUR_HYGRAPH_WEBHOOK_SECRET` |
| **Method** | POST |
| **Content Type** | application/json |
| **Secret** | *(leave blank - secret is in URL)* |

3. Under **Triggers**, select:
   - ✅ **Post** → Publish
   - ✅ **Post** → Update (Published content)

4. Click **Create**

## 7. Test the Integration

### Quick Test:
```bash
curl -X POST 'https://blog.urtechy.com/api/dub-webhook?secret=YOUR_SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "operation": "publish",
    "data": {
      "__typename": "Post",
      "id": "test123",
      "slug": "test-post",
      "title": "Test Post"
    }
  }'
```

### Full Test:
1. Create a draft post in Hygraph
2. Publish the post
3. Check the `shortUrl` field is populated
4. Visit the short URL and verify redirect

## Pricing Reference

| Plan | Links/month | Clicks/month | Price |
|------|-------------|--------------|-------|
| Free | 25 | 1,000 | $0 |
| Pro | 1,000 | 50,000 | $24/mo |
| Business | 10,000 | 250,000 | $59/mo |

## Troubleshooting

### "API key not configured"
- Verify `DUB_API_KEY` is set in `.env.local`
- Restart your dev server after adding env vars

### "Rate limit exceeded"
- Free tier: 10 requests/second
- The service caches results to minimize API calls

### Webhook not triggering
- Check webhook URL includes `?secret=YOUR_SECRET`
- Verify triggers are set for "Publish" operation
- Check Hygraph webhook logs for errors

### Custom domain not working
- DNS propagation can take 24 hours
- Verify CNAME record is correct
- Check domain status in Dub.co dashboard
