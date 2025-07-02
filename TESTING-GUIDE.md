# Testing Guide for Production Deployment

## Manual Testing Checklist

### 🔧 Pre-Deployment Testing

#### 1. Build and Start Testing
```bash
# Test production build
npm run build
npm run start

# Test on localhost:3000
# Verify all pages load correctly
# Check for console errors
# Test all interactive features
```

#### 2. Core Functionality Testing

**Homepage Testing:**
- [ ] Homepage loads without errors
- [ ] Featured posts display correctly
- [ ] Navigation menu works
- [ ] Mobile menu functions properly
- [ ] All images load with proper alt text
- [ ] Loading states work correctly

**Post Pages Testing:**
- [ ] Individual post pages load
- [ ] Images display correctly
- [ ] Social media embeds work
- [ ] Comments system functions
- [ ] Related posts show up
- [ ] Breadcrumb navigation works

**Category Pages Testing:**
- [ ] Category pages load
- [ ] Posts filter correctly by category
- [ ] Pagination works (if implemented)

**Special Pages Testing:**
- [ ] About page loads
- [ ] Contact page loads and form works
- [ ] 404 page displays correctly
- [ ] Cricket live scores work (if applicable)

#### 3. Performance Testing

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

**Load Testing:**
- [ ] Page load time < 3 seconds
- [ ] Images load progressively
- [ ] Service worker caches resources
- [ ] Offline functionality works (PWA)

#### 4. SEO Testing

**Meta Tags:**
- [ ] Title tags are unique and descriptive
- [ ] Meta descriptions are present and optimized
- [ ] Open Graph tags work (test with Facebook debugger)
- [ ] Twitter Card tags work (test with Twitter validator)

**Structured Data:**
- [ ] JSON-LD structured data is valid
- [ ] Test with Google Rich Results Test
- [ ] Article schema is properly implemented
- [ ] Breadcrumb schema works

**Sitemaps:**
- [ ] `/sitemap.xml` is accessible
- [ ] `/sitemap-news.xml` is accessible
- [ ] `/robots.txt` is properly configured
- [ ] All URLs in sitemap are accessible

#### 5. Accessibility Testing

**Keyboard Navigation:**
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Modal can be closed with Escape key

**Screen Reader Testing:**
- [ ] All images have meaningful alt text
- [ ] Headings are properly structured (H1 → H2 → H3)
- [ ] Form inputs have proper labels
- [ ] ARIA labels are used where needed

**Color and Contrast:**
- [ ] Text has sufficient color contrast
- [ ] Information is not conveyed by color alone
- [ ] Focus states are clearly visible

#### 6. Cross-Browser Testing

**Desktop Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Browsers:**
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Samsung Internet

#### 7. Responsive Design Testing

**Breakpoints:**
- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1440px+)

**Features:**
- [ ] Navigation adapts to screen size
- [ ] Images scale properly
- [ ] Text remains readable
- [ ] Touch targets are adequate (44px minimum)

#### 8. Security Testing

**Headers:**
- [ ] Security headers are present (CSP, X-Frame-Options, etc.)
- [ ] HTTPS is enforced
- [ ] No sensitive data in client-side code

**API Endpoints:**
- [ ] API routes have proper error handling
- [ ] Rate limiting is in place (if applicable)
- [ ] Input validation works
- [ ] CORS is properly configured

#### 9. Error Handling Testing

**Error Boundaries:**
- [ ] JavaScript errors are caught by error boundaries
- [ ] Fallback UI displays for broken components
- [ ] Error reporting works (if implemented)

**Network Errors:**
- [ ] API failures show appropriate messages
- [ ] Offline state is handled gracefully
- [ ] Retry mechanisms work

**404 and Error Pages:**
- [ ] 404 page displays for invalid URLs
- [ ] 500 error page works
- [ ] Error pages have proper navigation

### 🚀 Production Environment Testing

#### 1. Deployment Verification
```bash
# After deployment, test:
curl -I https://your-domain.com
# Check status code is 200
# Verify security headers
```

#### 2. CDN and Caching
- [ ] Static assets load from CDN
- [ ] Cache headers are properly set
- [ ] Images are optimized and cached
- [ ] Service worker updates correctly

#### 3. Analytics and Monitoring
- [ ] Google Analytics tracking works
- [ ] Error monitoring captures issues
- [ ] Performance monitoring is active
- [ ] Health check endpoint responds

#### 4. External Integrations
- [ ] Hygraph API connectivity
- [ ] Firebase services work
- [ ] Social media embeds load
- [ ] External APIs respond correctly

### 🔍 Automated Testing Tools

#### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze
```

#### Security Scan
```bash
# Run security audit
npm audit --audit-level moderate
```

### 📊 Monitoring Setup

#### Health Checks
- [ ] `/api/health` endpoint responds
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set

#### Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] Error rate monitoring
- [ ] API response time tracking

#### User Experience Monitoring
- [ ] Real user monitoring (RUM)
- [ ] Conversion funnel tracking
- [ ] User journey analysis

### 🐛 Common Issues and Solutions

#### Build Issues
- Missing dependencies → Run `npm install`
- TypeScript errors → Run `npm run type-check`
- Bundle size too large → Analyze with `npm run build:analyze`

#### Runtime Issues
- Hydration mismatches → Check SSR/CSR consistency
- Memory leaks → Monitor with performance tools
- Slow API responses → Check network and caching

#### SEO Issues
- Missing meta tags → Verify SEO components
- Structured data errors → Test with Google tools
- Sitemap issues → Check generation scripts

### ✅ Final Production Checklist

Before going live:
- [ ] All tests pass
- [ ] Performance meets targets
- [ ] Security scan clean
- [ ] Accessibility compliant
- [ ] SEO optimized
- [ ] Error handling robust
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan ready

---

**Remember:** Test early, test often, and always have a rollback plan!
