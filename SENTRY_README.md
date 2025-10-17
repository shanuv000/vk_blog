# 🚨 Sentry Error Tracking - Quick Start

## What is Sentry?

Sentry automatically tracks errors, performance issues, and logs in your application. When something goes wrong in production, you'll know about it immediately with detailed error reports.

## 🎯 Quick Facts

- **Free Tier**: 5,000 errors/month, 10,000 performance units/month
- **Organization**: urtechy-r0
- **Project**: urtechy-blog
- **Version**: @sentry/nextjs v10.20.0
- **Status**: ✅ Fully Configured

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SENTRY_INTEGRATION.md` | Complete integration guide with all details |
| `SENTRY_USAGE_GUIDE.md` | Code examples for using Sentry in your app |
| `SENTRY_DEPLOYMENT_CHECKLIST.md` | Step-by-step deployment checklist |
| `SENTRY_IMPLEMENTATION_SUMMARY.md` | Summary of what was implemented |
| **This file** | Quick reference for getting started |

## 🚀 For Developers

### In Development
Errors are **logged to console only** - not sent to Sentry (saves quota).

```javascript
// Console will show:
// "Sentry Event (dev mode - not sent): {...}"
```

### In Production
Errors are automatically sent to Sentry dashboard.

### Quick Usage
```javascript
import * as Sentry from "@sentry/nextjs";

// Capture an error
try {
  await fetchData();
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: "blog" }
  });
}

// Add context
Sentry.setContext("user_action", {
  page: "home",
  action: "subscribe"
});
```

**See `SENTRY_USAGE_GUIDE.md` for more examples.**

## 🚀 For Deployment

### Required Environment Variables
Add these to your deployment platform (Vercel, etc.):

```bash
SENTRY_ORG=urtechy-r0
SENTRY_PROJECT=urtechy-blog
SENTRY_AUTH_TOKEN=<get-from-sentry.io>
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Get Auth Token
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Create new token with `project:releases` scope
3. Copy and add to environment variables

**See `SENTRY_DEPLOYMENT_CHECKLIST.md` for full deployment steps.**

## 🔍 Monitoring

### Dashboard Access
- **Main Dashboard**: https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/
- **Issues**: https://sentry.io/organizations/urtechy-r0/issues/
- **Performance**: https://sentry.io/organizations/urtechy-r0/performance/

### What's Tracked
- ✅ JavaScript errors (client & server)
- ✅ API route errors
- ✅ Performance metrics (10% sample)
- ✅ Application logs (production only)
- ❌ Session Replay (disabled to save quota)

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `sentry.server.config.ts` | Server-side error tracking |
| `sentry.edge.config.ts` | Edge runtime error tracking |
| `instrumentation-client.ts` | Client-side error tracking |
| `instrumentation.ts` | Runtime detection |
| `pages/_error.js` | Custom error page integration |
| `next.config.js` | Webpack plugin configuration |

## 🎛️ Free Tier Optimizations

To stay within free tier limits:
- ✅ 10% sampling rate (captures 1 in 10 events)
- ✅ Development mode doesn't count against quota
- ✅ Common errors filtered out (browser extensions, etc.)
- ✅ No PII sent (privacy first)
- ✅ Production-only logs

## 🧪 Testing

### Test Locally
```bash
npm run dev
```
Check console for: `"Sentry Event (dev mode - not sent)"`

### Test in Production
Add a test button:
```javascript
<button onClick={() => { throw new Error("Test Error"); }}>
  Test Sentry
</button>
```

Visit Sentry dashboard after 1-2 minutes to see the error.

## 📊 Common Tasks

### View Recent Errors
1. Go to https://sentry.io
2. Select organization: urtechy-r0
3. Select project: urtechy-blog
4. Click "Issues"

### Adjust Sample Rate
Edit environment variable:
```bash
# More data (20% of events)
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.2

# Less data (5% of events)
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05
```

### Check Quota Usage
https://sentry.io/organizations/urtechy-r0/stats/

## 🐛 Troubleshooting

### Errors Not Showing in Sentry
- Check you're in production mode (not development)
- Wait 1-2 minutes for ingestion
- Verify environment variables are set
- Check Sentry dashboard project is correct

### Build Fails
- Ensure `SENTRY_AUTH_TOKEN` is set
- Check token has correct permissions
- Verify internet connection during build

### Too Many Events
- Lower sample rate in environment variables
- Review `ignoreErrors` in config files
- Check for error loops in code

## 📚 Learn More

- **Full Integration Guide**: `SENTRY_INTEGRATION.md`
- **Usage Examples**: `SENTRY_USAGE_GUIDE.md`
- **Deployment Steps**: `SENTRY_DEPLOYMENT_CHECKLIST.md`
- **Official Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

## ✅ Quick Checklist

Before deploying to production:
- [ ] Sentry auth token obtained
- [ ] Environment variables added to deployment platform
- [ ] Test build runs successfully locally
- [ ] Review deployment checklist
- [ ] Verify errors appear in Sentry after deployment

## 💡 Pro Tips

1. **Add Context**: Always include tags and extra data with errors
2. **Monitor Quota**: Check usage weekly
3. **Review Errors**: Set aside time weekly to review dashboard
4. **Set Up Alerts**: Get notified of critical errors immediately
5. **Use in Development**: Check console logs to ensure Sentry captures what you expect

## 🆘 Need Help?

1. Check `SENTRY_INTEGRATION.md` for detailed information
2. Visit https://docs.sentry.io for official documentation
3. Check https://forum.sentry.io for community support
4. Contact Sentry support at https://sentry.io/support/

---

**Quick Links**:
- [Sentry Dashboard](https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/)
- [Get Auth Token](https://sentry.io/settings/account/api/auth-tokens/)
- [Check Quota](https://sentry.io/organizations/urtechy-r0/stats/)
- [Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

**Status**: ✅ Ready to Deploy
**Last Updated**: October 17, 2025
