# 🧪 Sentry Testing Guide - urTechy Blog

## ✅ Test Page Created!

Your Sentry test page is now available at: **http://localhost:3000/sentry-example-page**

---

## 🚀 Quick Start Testing

### Step 1: Visit the Test Page

The development server is running. Open your browser to:
```
http://localhost:3000/sentry-example-page
```

### Step 2: Open Browser Console

Open your browser's developer tools:
- **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
- **Safari**: Enable Developer Menu first, then `Cmd+Option+C`

### Step 3: Trigger Test Errors

The page has 6 different test buttons:

1. **Throw Error** - Simple JavaScript error
2. **Call Undefined Function** - Calls `myUndefinedFunction()`
3. **Manual Capture** - Manually captured exception with context
4. **Send Message** - Info message to Sentry
5. **Async Error** - Async function error
6. **Promise Rejection** - Unhandled promise rejection

### Step 4: Check Console Output

In **development mode**, you'll see messages like:
```
Sentry Event (dev mode - not sent): {...}
```

This confirms Sentry is working but NOT sending events (saves your quota).

---

## 📊 Testing in Production

### Option 1: Set Production Mode Locally

1. Stop the dev server (`Ctrl+C`)
2. Set environment to production:
   ```bash
   export NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   ```
3. Build and start:
   ```bash
   npm run build
   npm start
   ```
4. Visit: http://localhost:3000/sentry-example-page
5. Click a test button
6. Check Sentry dashboard after 1-2 minutes

### Option 2: Test in Production Deployment

1. Deploy to Vercel (with environment variables set)
2. Visit: https://your-domain.com/sentry-example-page
3. Click test buttons
4. Check Sentry dashboard

---

## 🔍 What to Look For

### In Development (Console)

You should see:
```javascript
Sentry Event (dev mode - not sent): {
  event_id: "...",
  exception: {
    values: [{
      type: "Error",
      value: "Sentry Test Error: This is a deliberate test error!",
      stacktrace: { ... }
    }]
  },
  tags: { ... },
  extra: { ... }
}
```

### In Production (Sentry Dashboard)

1. Go to: https://sentry.io/organizations/urtechy-r0/issues/
2. Wait 1-2 minutes for ingestion
3. Look for new issues:
   - "Sentry Test Error: This is a deliberate test error!"
   - "myUndefinedFunction is not a function"
   - "Manually captured error for testing"
   - etc.

4. Click on an issue to see:
   - Full stack trace
   - Source maps (readable code)
   - Tags: `test: "manual-capture"`, `page: "sentry-example"`
   - Extra context
   - Breadcrumbs (user actions)

---

## ✅ Success Criteria

### You've Successfully Set Up Sentry If:

- ✅ Development: Console shows "Sentry Event (dev mode - not sent)"
- ✅ Production: Issues appear in Sentry dashboard
- ✅ Stack traces are readable (source maps working)
- ✅ Tags and context are visible
- ✅ No build errors

---

## 🐛 Troubleshooting

### "Nothing happens when I click buttons"

**In Development**: 
- Open browser console to see Sentry events
- Events are logged but NOT sent to Sentry.io

**Check**:
- Browser console is open
- JavaScript is enabled
- No browser extensions blocking scripts

### "Errors not appearing in Sentry"

**Checklist**:
1. Are you in production mode?
   - Check: `process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT`
   - Should be: `production` (not `development`)

2. Wait 1-2 minutes for ingestion

3. Check the correct project:
   - https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/

4. Verify environment variables are set:
   ```bash
   echo $SENTRY_AUTH_TOKEN  # Should not be empty
   ```

5. Check Sentry quota:
   - https://sentry.io/organizations/urtechy-r0/stats/
   - Ensure you haven't exceeded free tier limits

### "Source maps not working"

**Solution**:
1. Ensure `SENTRY_AUTH_TOKEN` is set during build
2. Check build logs for:
   ```
   Sentry: Uploading source maps...
   ✓ Source maps uploaded to Sentry
   ```
3. Rebuild: `npm run build`

### "Page shows 404"

**Solution**:
1. Ensure dev server is running: `npm run dev`
2. Visit exact URL: http://localhost:3000/sentry-example-page
3. Check pages directory has the file

---

## 📝 Test Scenarios

### Scenario 1: Basic Error Tracking
```javascript
// Click "Throw Error" button
// Expected: Error appears in console (dev) or Sentry (prod)
```

### Scenario 2: Undefined Function
```javascript
// Click "Call Undefined Function" button
// Expected: ReferenceError: myUndefinedFunction is not defined
```

### Scenario 3: Manual Exception with Context
```javascript
// Click "Capture Exception" button
// Expected: Error with tags and extra data
// Check: Tags show "test: manual-capture"
```

### Scenario 4: Message Logging
```javascript
// Click "Send Message" button
// Expected: Info message in Sentry
// Level: info (not error)
```

### Scenario 5: Async Error
```javascript
// Click "Throw Async Error" button
// Expected: Async error captured correctly
```

### Scenario 6: Promise Rejection
```javascript
// Click "Reject Promise" button
// Expected: Unhandled promise rejection error
```

---

## 🎯 Next Steps After Testing

### If Tests Pass:

1. **Remove or Hide Test Page**:
   ```bash
   # Option 1: Delete the test page
   rm pages/sentry-example-page.js
   
   # Option 2: Add to .gitignore (keep locally)
   echo "pages/sentry-example-page.js" >> .gitignore
   ```

2. **Deploy to Production**:
   ```bash
   git add .
   git commit -m "Add Sentry error tracking"
   git push
   ```

3. **Set Up Alerts**:
   - Go to Sentry project settings
   - Configure email/Slack notifications
   - Set up alert rules

4. **Monitor Dashboard**:
   - Bookmark: https://sentry.io/organizations/urtechy-r0/issues/
   - Check weekly for new issues

### If Tests Fail:

1. **Check Console for Errors**:
   - Look for Sentry initialization errors
   - Check for configuration issues

2. **Verify Environment Variables**:
   ```bash
   cat .env.local | grep SENTRY
   ```

3. **Review Configuration Files**:
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - `instrumentation-client.ts`

4. **Check Documentation**:
   - See `SENTRY_INTEGRATION.md` for detailed setup
   - Review `SENTRY_TROUBLESHOOTING.md` (if exists)

---

## 📚 Additional Test Ideas

### Test API Route Errors

Create `pages/api/test-sentry.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

export default async function handler(req, res) {
  try {
    throw new Error("API Route Test Error");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: "test" }
    });
    res.status(500).json({ error: "Test error" });
  }
}
```

Visit: http://localhost:3000/api/test-sentry

### Test Server-Side Error

Add to any page with `getServerSideProps`:
```javascript
export async function getServerSideProps() {
  // This will be caught by Sentry server config
  throw new Error("Server-Side Test Error");
}
```

---

## 📊 Expected Results

### Development Mode
```
✅ Console shows: "Sentry Event (dev mode - not sent)"
✅ Full error details in console
✅ No errors sent to Sentry.io (saves quota)
✅ Page doesn't crash (error boundary works)
```

### Production Mode
```
✅ Error appears in Sentry dashboard within 1-2 minutes
✅ Stack trace is readable (source maps)
✅ Tags and context visible
✅ Breadcrumbs show user actions
✅ Environment: production
✅ Sample rate: 10% (1 in 10 events captured)
```

---

## 🔗 Quick Links

- **Test Page**: http://localhost:3000/sentry-example-page
- **Sentry Dashboard**: https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/
- **Issues**: https://sentry.io/organizations/urtechy-r0/issues/
- **Stats**: https://sentry.io/organizations/urtechy-r0/stats/

---

## ✨ Pro Tips

1. **Test Multiple Times**: Click different buttons to see various error types
2. **Check Tags**: Use tags to filter and search errors
3. **Review Breadcrumbs**: See what user did before error
4. **Test Both Modes**: Try development and production
5. **Monitor Quota**: Keep an eye on your usage

---

## 🎉 Success!

If you see "Sentry Event" in console (dev) or issues in dashboard (prod), 
**congratulations! Your Sentry integration is working perfectly!** 🎊

---

**Created**: October 17, 2025  
**Status**: ✅ Ready to Test  
**Server**: Running on http://localhost:3000  
**Test Page**: http://localhost:3000/sentry-example-page
