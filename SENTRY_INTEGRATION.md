# Sentry Integration Guide

## Overview

Sentry has been successfully integrated into the urTechy Blog application for error tracking, performance monitoring, and logging. This document provides comprehensive information about the setup and usage.

## 🎯 What Was Implemented

### 1. **Sentry SDK Installation**
- `@sentry/nextjs` v10.20.0 installed
- Automatic instrumentation for Next.js

### 2. **Configuration Files Created**

#### Server-Side Configuration
- **File**: `sentry.server.config.ts`
- **Purpose**: Handles server-side error tracking
- **Features**: 
  - Server error capture
  - Performance monitoring
  - Request tracking

#### Edge Runtime Configuration
- **File**: `sentry.edge.config.ts`
- **Purpose**: Handles edge runtime error tracking (middleware, edge routes)
- **Features**:
  - Edge function monitoring
  - Middleware error tracking

#### Client-Side Configuration
- **File**: `instrumentation-client.ts`
- **Purpose**: Handles browser-side error tracking
- **Features**:
  - Browser error capture
  - Performance monitoring
  - Router transition tracking

#### Instrumentation
- **File**: `instrumentation.ts`
- **Purpose**: Registers Sentry based on runtime environment
- **Features**:
  - Automatic runtime detection
  - Request error handling

### 3. **Custom Error Page Integration**
- **File**: `pages/_error.js`
- **Updated**: Integrated `Sentry.captureUnderscoreErrorException()` to capture all errors
- **Features**:
  - Automatic error reporting to Sentry
  - User-friendly error display
  - Maintains existing error page design

### 4. **Next.js Configuration**
- **File**: `next.config.js`
- **Added**: Sentry webpack plugin configuration
- **Features**:
  - Source map uploads for better error traces
  - Automatic Vercel Cron Monitors
  - Tree-shaking of Sentry logger in production

## 🔧 Configuration Details

### Organization & Project
- **Organization**: `urtechy-r0`
- **Project**: `urtechy-blog`
- **DSN**: `https://01bc457e6fd07ca0356b8d62e3a8f148@o4510203549384704.ingest.us.sentry.io/4510205861363712`

### Free Tier Optimizations

To stay within Sentry's free tier limits, the following optimizations were implemented:

1. **Reduced Sample Rate**
   - Traces Sample Rate: 10% (0.1) in production
   - Configurable via `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`

2. **Privacy Protection**
   - `sendDefaultPii: false` - No personally identifiable information sent

3. **Error Filtering**
   - Common browser extension errors ignored
   - Network errors filtered
   - 404 errors not tracked
   - Cancelled requests ignored

4. **Development Mode**
   - Errors logged to console in development
   - Not sent to Sentry in development (saves quota)

5. **Production-Only Logs**
   - Logs only enabled in production environment

## 📋 Environment Variables

### Required Variables
Add these to your `.env.local` file:

```bash
# Optional: Control which environment errors come from
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Optional: Adjust sample rate (0.0 to 1.0)
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### For Source Map Uploads
Required for deploying to production and uploading source maps:

```bash
SENTRY_ORG=urtechy-r0
SENTRY_PROJECT=urtechy-blog
SENTRY_AUTH_TOKEN=your-sentry-auth-token-here
```

**To get your auth token:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Create a new token with `project:releases` scope
3. Add it to your `.env.local` and deployment environment variables

## 🚀 Features Enabled

### ✅ Performance Monitoring (Tracing)
- Tracks application performance
- Monitors page load times
- Identifies slow API calls
- Sample rate: 10% to save quota

### ✅ Error Tracking
- Captures JavaScript errors
- Server-side error tracking
- API route error monitoring
- Custom error boundary integration

### ✅ Logging
- Application logs sent to Sentry (production only)
- Debug information for troubleshooting
- Structured logging support

### ❌ Session Replay (Disabled)
- Not enabled to conserve free tier quota
- Can be enabled later if needed

## 📊 What Gets Tracked

### Client-Side
- JavaScript errors
- Unhandled promise rejections
- Network request failures
- React component errors
- Page navigation performance
- Router transitions

### Server-Side
- API route errors
- Server-side rendering errors
- Build-time errors
- Edge function errors

### What's NOT Tracked
- Development environment errors (logged to console only)
- Common browser extension errors
- 404 errors
- Network timeout errors
- User PII (privacy protection)

## 🔍 Monitoring Your Application

### Access Sentry Dashboard
1. Go to https://sentry.io
2. Select organization: `urtechy-r0`
3. Select project: `urtechy-blog`

### What You'll See
- **Issues**: All errors grouped by type
- **Performance**: Transaction data and slow operations
- **Releases**: Track deployments and their health
- **Discover**: Custom queries on your data

## 🧪 Testing Sentry Integration

### Test Error Capture
Add a test error button to any page:

```javascript
import * as Sentry from "@sentry/nextjs";

// In your component
<button onClick={() => {
  throw new Error("Test Sentry Error");
}}>
  Test Sentry
</button>
```

### Test Performance
Sentry automatically tracks:
- Page loads
- API calls
- Component renders
- Navigation events

## 🔐 Security Best Practices

1. **No PII**: `sendDefaultPii` is set to `false`
2. **Filtered Data**: Sensitive data should be scrubbed before sending
3. **Environment Variables**: Auth tokens stored securely
4. **Error Filtering**: Common non-critical errors ignored

## 📈 Free Tier Limits

Sentry Free Tier includes:
- **5,000 errors/month**
- **10,000 performance units/month**
- **1 user**
- **30 day data retention**

Our optimizations help stay within these limits:
- 10% sampling rate reduces data sent by 90%
- Error filtering removes noise
- Development mode doesn't count against quota

## 🛠️ Maintenance

### Adjusting Sample Rate
Edit environment variables:
```bash
# More aggressive (5% sampling)
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05

# More data (20% sampling)
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.2
```

### Enabling Session Replay
If you upgrade or need this feature:

1. Update `instrumentation-client.ts`:
```typescript
Sentry.init({
  // ...existing config
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

2. Add to `next.config.js` build options:
```javascript
widenClientFileUpload: true,
```

### Updating Sentry
```bash
npm update @sentry/nextjs
```

## 📝 Common Tasks

### View Recent Errors
1. Go to Sentry Dashboard
2. Click "Issues"
3. Filter by date, environment, etc.

### Create Alerts
1. Go to "Alerts" in Sentry
2. Create alert rule for specific error conditions
3. Set notification preferences (email, Slack, etc.)

### Track Releases
Sentry automatically creates releases based on your git commits when you deploy.

### Custom Error Context
Add extra context to errors:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.setContext("character", {
  name: "Blog Post",
  id: postId,
  category: category,
});

// Or set user context
Sentry.setUser({
  id: userId,
  email: email, // Only if you enable PII
});
```

## 🐛 Troubleshooting

### Errors Not Appearing
1. Check if you're in development mode (errors logged to console only)
2. Verify DSN is correct in config files
3. Check browser console for Sentry initialization messages
4. Verify error isn't in the `ignoreErrors` list

### Source Maps Not Working
1. Ensure `SENTRY_AUTH_TOKEN` is set
2. Check build output for source map upload messages
3. Verify organization and project names are correct

### Too Many Events
1. Lower sample rate in environment variables
2. Add more errors to `ignoreErrors` list
3. Review and filter noisy errors in Sentry dashboard

## 📚 Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/configuration/options/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Sentry Dashboard](https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/)

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- [ ] Set `SENTRY_AUTH_TOKEN` in deployment platform
- [ ] Verify `.env.example` is updated with Sentry variables
- [ ] Test error capturing in staging
- [ ] Review sample rate configuration
- [ ] Set up email/Slack alerts in Sentry dashboard
- [ ] Add team members to Sentry project (if needed)

## 🎉 Benefits

1. **Proactive Error Detection**: Know about errors before users report them
2. **Performance Insights**: Identify slow pages and API calls
3. **Better Debugging**: Stack traces with source maps
4. **Release Tracking**: Monitor the health of each deployment
5. **Free Tier**: Zero cost for moderate traffic sites

---

**Last Updated**: October 17, 2025
**Sentry Version**: @sentry/nextjs v10.20.0
**Status**: ✅ Active and Configured
