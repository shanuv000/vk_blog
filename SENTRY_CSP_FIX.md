# 🔧 Content Security Policy (CSP) Fix for Sentry

## ⚠️ Issue Identified

The browser console showed multiple CSP violations preventing Sentry from working:

```
[Error] Refused to connect to https://o4510203549384704.ingest.us.sentry.io/...
because it does not appear in the connect-src directive of the Content Security Policy.
```

## ✅ Solution Applied

Updated `next.config.js` to add Sentry and other service domains to the CSP `connect-src` directive.

### What Was Added

#### Sentry (Error Tracking)
- `https://o4510203549384704.ingest.us.sentry.io` - Your specific Sentry endpoint
- `https://*.ingest.sentry.io` - All Sentry ingest endpoints (for future flexibility)

#### Firebase (Analytics)
- `https://firebase.googleapis.com` - Firebase configuration
- `https://firebaseinstallations.googleapis.com` - Firebase installations

#### Google Analytics
- `https://www.google-analytics.com` - GA endpoints
- `https://www.googletagmanager.com` - GTM endpoints

#### Microsoft Clarity
- `https://www.clarity.ms` - Clarity analytics

#### Hygraph APIs
- `https://api-ap-south-1.hygraph.com` - Your Hygraph content API
- `https://ap-south-1.cdn.hygraph.com` - Your Hygraph CDN
- `https://*.hygraph.com` - All Hygraph domains
- `https://*.graphassets.com` - Hygraph assets

### Updated CSP Configuration

```javascript
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            // Frame/embed sources
            "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com https://twitter.com https://x.com https://www.facebook.com https://web.facebook.com https://www.instagram.com https://instagram.com;",
            
            // Scripts - Added Google Analytics, Clarity, Firebase
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://connect.facebook.net https://www.instagram.com https://instagram.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms;",
            
            // XHR/fetch targets - Added Sentry, Firebase, Google Analytics, Clarity, Hygraph APIs
            "connect-src 'self' https://syndication.twitter.com https://api.twitter.com https://graph.facebook.com https://www.instagram.com https://instagram.com https://o4510203549384704.ingest.us.sentry.io https://*.ingest.sentry.io https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://api-ap-south-1.hygraph.com https://ap-south-1.cdn.hygraph.com https://*.hygraph.com https://*.graphassets.com;",
          ].join(" "),
        },
      ],
    },
  ];
},
```

## 🧪 Testing the Fix

### Step 1: Restart Development Server

The server needs to restart to pick up the config changes:

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 2: Test Sentry

1. Visit: http://localhost:3000/sentry-example-page
2. Open browser console (`F12`)
3. Click "Throw Error" button
4. You should now see:
   - ✅ "Sentry Event (dev mode - not sent)" (in development)
   - ✅ No CSP errors in console

### Step 3: Verify Other Services

After the fix, these should also work without CSP errors:
- ✅ Google Analytics
- ✅ Firebase Analytics
- ✅ Microsoft Clarity
- ✅ Hygraph API calls

## 📋 Expected Console Output

### Before Fix (❌ Errors):
```
[Error] Refused to connect to https://o4510203549384704.ingest.us.sentry.io/...
[Error] Refused to connect to https://firebase.googleapis.com/...
[Error] Refused to connect to https://api-ap-south-1.hygraph.com/...
```

### After Fix (✅ Clean):
```
[Log] Sentry Event (dev mode - not sent): {...}
[Info] Successfully connected to all services
```

## 🚀 Production Deployment

### Before Deploying:

1. **Test Locally**: Restart dev server and verify no CSP errors
2. **Build Test**: Run `npm run build` to ensure no issues
3. **Deploy**: Push to production

### After Deploying:

1. **Check Sentry**: Visit https://sentry.io/organizations/urtechy-r0/issues/
2. **Trigger Test Error**: Visit your production site and click test buttons
3. **Verify Events**: Errors should appear in Sentry within 1-2 minutes

## 🔐 Security Notes

### Why These Domains Are Safe

All added domains are:
- ✅ **Official Services**: Sentry, Google, Microsoft, Hygraph
- ✅ **HTTPS Only**: All use secure connections
- ✅ **Legitimate Use**: Required for analytics and error tracking
- ✅ **Your Account**: Sentry endpoint is specific to your account

### CSP Best Practices

1. **Specific Domains**: Added specific domains (not wildcards where possible)
2. **HTTPS Only**: All connections use HTTPS
3. **Minimal Wildcards**: Only used for CDN/regional endpoints (*.hygraph.com)
4. **No 'unsafe' directives**: Avoided adding more 'unsafe-*' directives

## 🐛 Troubleshooting

### If You Still See CSP Errors:

1. **Restart Dev Server**: 
   ```bash
   # Kill current server
   Ctrl+C
   
   # Start fresh
   npm run dev
   ```

2. **Clear Browser Cache**:
   - Chrome: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
   - Clear "Cached images and files"

3. **Hard Reload**:
   - Chrome: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

4. **Check Build**:
   ```bash
   npm run build
   # Look for any errors
   ```

### If Sentry Still Not Working:

1. **Check Environment Variables**:
   ```bash
   cat .env.local | grep SENTRY
   # Should show all SENTRY_* variables
   ```

2. **Verify Config Files**:
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - `instrumentation-client.ts`

3. **Check DSN**:
   - Open config files
   - Verify DSN matches: `https://01bc457e6fd07ca0356b8d62e3a8f148@o4510203549384704.ingest.us.sentry.io/4510205861363712`

## 📚 Additional Resources

### Content Security Policy
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

### Sentry Documentation
- [Sentry CSP Guide](https://docs.sentry.io/product/security/csp/)
- [Next.js CSP](https://nextjs.org/docs/advanced-features/security-headers)

## ✅ Verification Checklist

After restarting the server:

- [ ] No CSP errors in browser console
- [ ] Sentry events appear in console (dev mode)
- [ ] Google Analytics loads without errors
- [ ] Firebase initializes without errors
- [ ] Hygraph API calls succeed
- [ ] Test page works: http://localhost:3000/sentry-example-page
- [ ] Click test buttons work without CSP blocking

## 🎉 Success!

Once you restart the server and see no CSP errors, your Sentry integration will be fully functional!

### Next Steps:

1. **Restart Server**: `Ctrl+C` then `npm run dev`
2. **Test Again**: Visit http://localhost:3000/sentry-example-page
3. **Verify**: No CSP errors in console
4. **Deploy**: Push to production when ready

---

**Issue Fixed**: October 17, 2025  
**Root Cause**: Content Security Policy blocking Sentry connections  
**Solution**: Added Sentry domains to `connect-src` CSP directive  
**Status**: ✅ Ready for Testing  

---

## 🔄 Quick Command Reference

```bash
# Restart development server
Ctrl+C
npm run dev

# Visit test page
open http://localhost:3000/sentry-example-page

# Check for CSP errors (should be none)
# Open browser console and look for "Refused to connect" errors

# Build for production
npm run build

# Deploy
git add .
git commit -m "Fix CSP to allow Sentry and analytics services"
git push
```
