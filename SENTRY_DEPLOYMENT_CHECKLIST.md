# Sentry Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Sentry Account Setup
- [ ] Sentry account created at https://sentry.io
- [ ] Organization created: `urtechy-r0`
- [ ] Project created: `urtechy-blog`
- [ ] Free tier confirmed (5,000 errors/month, 10,000 performance units/month)

### 2. Get Sentry Auth Token
- [ ] Go to https://sentry.io/settings/account/api/auth-tokens/
- [ ] Click "Create New Token"
- [ ] Name: "urtechy-blog-deployment"
- [ ] Scopes needed:
  - [ ] `project:releases`
  - [ ] `project:write`
  - [ ] `org:read`
- [ ] Copy token (you won't see it again!)

### 3. Environment Variables Setup

#### For Vercel (or other hosting):
- [ ] Add `SENTRY_ORG=urtechy-r0`
- [ ] Add `SENTRY_PROJECT=urtechy-blog`
- [ ] Add `SENTRY_AUTH_TOKEN=<your-token-here>`
- [ ] Add `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- [ ] Add `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1` (or adjust as needed)

#### Local `.env.local` file:
```bash
SENTRY_ORG=urtechy-r0
SENTRY_PROJECT=urtechy-blog
SENTRY_AUTH_TOKEN=your-actual-token-here
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 4. Code Verification
- [✅] `sentry.server.config.ts` exists
- [✅] `sentry.edge.config.ts` exists
- [✅] `instrumentation.ts` exists
- [✅] `instrumentation-client.ts` exists
- [✅] `pages/_error.js` updated with Sentry
- [✅] `next.config.js` has Sentry webpack plugin
- [✅] `@sentry/nextjs` in package.json dependencies
- [✅] `.gitignore` includes Sentry files

### 5. Build Test
- [ ] Run `npm run build` locally
- [ ] Verify build completes successfully
- [ ] Check for Sentry source map upload messages in build output
- [ ] Look for: "Sentry: Uploading source maps..."

Expected build output:
```
▲ Next.js 14.x.x
✓ Compiled successfully

Sentry: Uploading source maps...
✓ Source maps uploaded to Sentry
```

### 6. Testing
- [ ] Test error capture works:
  ```javascript
  // Add to a test page
  <button onClick={() => { throw new Error("Test Error"); }}>
    Test Sentry
  </button>
  ```
- [ ] Check Sentry dashboard for test error
- [ ] Verify error appears within 1-2 minutes
- [ ] Check source maps are working (readable stack trace)

### 7. Sentry Dashboard Configuration

#### Alerts (Optional but Recommended):
- [ ] Go to Sentry project settings
- [ ] Navigate to "Alerts"
- [ ] Create alert: "Send email on new errors"
  - Conditions: When an event is first seen
  - Actions: Send email to team
- [ ] Create alert: "High error rate"
  - Conditions: >10 errors in 5 minutes
  - Actions: Send notification

#### Integrations (Optional):
- [ ] Slack integration (if using Slack)
  - Settings > Integrations > Slack
  - Connect workspace
  - Select channel for notifications
- [ ] Email notifications
  - Account Settings > Notifications
  - Enable error notifications

### 8. Deployment Platform Setup

#### Vercel:
```bash
# Set environment variables in Vercel dashboard
vercel env add SENTRY_ORG
vercel env add SENTRY_PROJECT
vercel env add SENTRY_AUTH_TOKEN
vercel env add NEXT_PUBLIC_SENTRY_ENVIRONMENT
vercel env add NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
```

Or add via dashboard:
1. Go to project settings
2. Environment Variables
3. Add each variable for Production, Preview, and Development

#### Other Platforms:
- Add same environment variables to your platform's env var settings
- Ensure they're available during build time

### 9. Final Checks Before Deploy
- [ ] `.env.local` has auth token (for local testing)
- [ ] `.env.example` updated (for team reference)
- [ ] Production environment variables set
- [ ] Sample rate appropriate (0.1 for free tier)
- [ ] Source map upload enabled
- [ ] No Sentry auth token in git

### 10. Deploy
- [ ] Deploy to production
- [ ] Monitor deployment logs
- [ ] Check for successful Sentry initialization
- [ ] Verify source map upload in build logs

### 11. Post-Deployment Verification
- [ ] Visit your production site
- [ ] Check browser console for Sentry messages
- [ ] Trigger a test error (if you added test button)
- [ ] Go to Sentry dashboard
- [ ] Verify error appears with correct:
  - [ ] Environment (production)
  - [ ] Stack trace
  - [ ] Source maps working (readable code)
  - [ ] Breadcrumbs present

### 12. Monitoring Setup
- [ ] Bookmark Sentry dashboard
- [ ] Set up daily/weekly review schedule
- [ ] Configure notification preferences
- [ ] Add team members to Sentry (if needed)

### 13. Quota Management
- [ ] Check current usage: https://sentry.io/organizations/urtechy-r0/stats/
- [ ] Verify sample rate keeps you under limits
- [ ] Set up quota alert (Settings > Subscription)
- [ ] Plan for quota increase if needed

## 🚨 Troubleshooting

### Source Maps Not Uploaded
**Problem**: Stack traces show minified code

**Solution**:
1. Verify `SENTRY_AUTH_TOKEN` is set correctly
2. Check token has `project:releases` scope
3. Check build logs for error messages
4. Verify internet connection during build

### Errors Not Appearing in Sentry
**Problem**: Errors occur but don't show in dashboard

**Solution**:
1. Check you're not in development mode (errors only logged locally)
2. Verify DSN is correct in config files
3. Check error isn't in `ignoreErrors` list
4. Wait 1-2 minutes for ingestion
5. Check Sentry project is receiving events

### Too Many Events Captured
**Problem**: Approaching quota limits too quickly

**Solution**:
1. Lower sample rate: `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`
2. Add more errors to `ignoreErrors` array
3. Review and filter noisy errors in dashboard
4. Use `beforeSend` to filter more aggressively

### Build Fails with Sentry Error
**Problem**: Build fails due to Sentry webpack plugin

**Solution**:
1. Ensure all environment variables are set
2. Check auth token is valid
3. Verify internet connection
4. Try: `npm rebuild @sentry/nextjs`

## 📞 Getting Help

- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Support**: https://sentry.io/support/
- **Community Forum**: https://forum.sentry.io/
- **GitHub Issues**: https://github.com/getsentry/sentry-javascript/issues

## 📊 Success Metrics

After deployment, verify:
- ✅ Errors appear in Sentry dashboard
- ✅ Source maps are working (readable stack traces)
- ✅ Performance data is being collected
- ✅ Error rates are within expected range
- ✅ Quota usage is sustainable (<5,000 errors/month)
- ✅ No build errors or warnings
- ✅ Team can access and review errors

## 🎉 You're Done!

Once all checkboxes are complete, your Sentry integration is fully deployed and operational!

**Next Steps**:
1. Monitor dashboard for the first week
2. Adjust sample rate if needed
3. Set up regular error review process
4. Document any custom error handling patterns

---

**Last Updated**: October 17, 2025
**Status**: Ready for Deployment
