# 🔐 Admin Developer Report: urTechy Blog

> **Generated:** December 21, 2025  
> **Project:** blog.urtechy.com  
> **Stack:** Next.js 14 + React 18 + Hygraph CMS

---

## 📊 Executive Summary

This is a **production-grade blog platform** built with Next.js, featuring:
- **Headless CMS**: Hygraph (GraphCMS) for content management
- **Live Cricket Integration**: External API proxy for live scores
- **Social Media Embeds**: Twitter, YouTube, Instagram, Facebook
- **Performance Monitoring**: Sentry, Google Analytics, Web Vitals
- **Notification System**: Telegram + Discord webhooks

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 14 + React 18 + Tailwind CSS + Framer Motion           │
├─────────────────────────────────────────────────────────────────┤
│                         API LAYER                                │
│  /api/hygraph-proxy  │  /api/cricket-proxy  │  /api/twitter     │
├─────────────────────────────────────────────────────────────────┤
│                       SERVICES LAYER                             │
│  services/hygraph.js  │  lib/apollo-client.js  │  Cache Manager │
├─────────────────────────────────────────────────────────────────┤
│                       EXTERNAL SERVICES                          │
│  Hygraph CMS  │  Firebase  │  Sentry  │  Google Analytics       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

| Directory | Purpose |
|-----------|---------|
| `/pages` | Next.js pages (Pages Router) |
| `/pages/api` | 23+ API routes for proxies & webhooks |
| `/components` | 80+ React components (Blog, Cricket, Social) |
| `/services` | Data fetching layer (Hygraph, comments, Twitter) |
| `/lib` | Apollo Client, Firebase, caching utilities |
| `/hooks` | 11 custom hooks (analytics, data fetching) |
| `/utils` | Utilities (image, category, validation) |
| `/styles` | SCSS + CSS modules |
| `/scripts` | Build & validation scripts |

---

## 🔧 Technology Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.28 | React framework |
| `react` | 18.2.0 | UI library |
| `tailwindcss` | 3.4.1 | Styling |
| `framer-motion` | 11.2.10 | Animations |

### Data & API
| Package | Version | Purpose |
|---------|---------|---------|
| `@apollo/client` | 3.13.8 | GraphQL client |
| `graphql` | 16.8.1 | GraphQL queries |
| `axios` | 1.6.8 | HTTP requests |
| `firebase` | 10.11.1 | Auth, Firestore, Analytics |

### Content
| Package | Version | Purpose |
|---------|---------|---------|
| `@graphcms/rich-text-react-renderer` | 0.6.2 | Rich text rendering |
| `html-react-parser` | 5.1.8 | HTML parsing |
| `prismjs` | 1.30.0 | Code highlighting |
| `react-syntax-highlighter` | 15.6.1 | Syntax highlighting |

### Media & Embeds
| Package | Version | Purpose |
|---------|---------|---------|
| `react-lite-youtube-embed` | 2.5.1 | YouTube embeds |
| `react-twitter-embed` | 4.0.4 | Twitter embeds |
| `react-social-media-embed` | 2.5.18 | Social embeds |
| `react-player` | 2.15.1 | Video player |

---

## 🌐 API Routes

### Content APIs
| Route | Purpose |
|-------|---------|
| `/api/hygraph-proxy` | Main GraphQL proxy (17KB) |
| `/api/direct-graphql` | Direct Hygraph queries |
| `/api/hygraph-schema` | Schema introspection |

### External Integrations
| Route | Purpose |
|-------|---------|
| `/api/cricket-proxy` | Live cricket scores proxy |
| `/api/twitter/*` | Twitter oEmbed API |
| `/api/firebase-proxy` | Firebase operations proxy |

### Webhooks
| Route | Purpose |
|-------|---------|
| `/api/hygraph-telegram-webhook` | CMS → Telegram notifications |
| `/api/telegram-notify` | Direct Telegram messaging |
| `/api/post-published-webhook` | New post notifications |

### Utilities
| Route | Purpose |
|-------|---------|
| `/api/health` | System health check |
| `/api/monitoring` | Performance monitoring |
| `/api/generate-sitemap` | Dynamic sitemap |
| `/api/sitemap-news` | Google News sitemap |
| `/api/revalidate-sitemap` | ISR revalidation |

---

## 🔑 Environment Variables

### Required for CMS
```bash
NEXT_PUBLIC_HYGRAPH_CONTENT_API     # Hygraph Content API
NEXT_PUBLIC_HYGRAPH_CDN_API         # Hygraph CDN (read-only)
HYGRAPH_AUTH_TOKEN                  # Auth token for mutations
```

### Analytics & Monitoring
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS        # GA4 measurement ID
SENTRY_ORG                          # Sentry organization
SENTRY_PROJECT                      # Sentry project name
SENTRY_AUTH_TOKEN                   # Source maps upload
```

### Firebase
```bash
NEXT_PUBLIC_FIREBASE_API_KEY        
NEXT_PUBLIC_FIREBASE_PROJECT_ID     
NEXT_PUBLIC_FIREBASE_APP_ID         
```

### Integrations
```bash
TELEGRAM_BOT_TOKEN                  # Telegram notifications
DISCORD_WEBHOOK_URL                 # Discord notifications
TINYURL_API_KEY                     # URL shortening
AI_UPDATE_SECRET                    # AI auto-update auth
```

---

## 📦 Key Components

### Homepage Components
| Component | Purpose |
|-----------|---------|
| `HeroSpotlight.jsx` | Featured posts hero section |
| `FeaturedHeroCarousel.jsx` | Carousel for featured content |
| `OptimizedHomepage.jsx` | Lazy-loaded homepage sections |
| `RecentUpdates.jsx` | Latest posts widget |

### Blog Components
| Component | Purpose |
|-----------|---------|
| `PostDetail.jsx` | Full article view |
| `PostCard.jsx` | Post preview card |
| `RichTextRenderer.jsx` | Hygraph rich text (61KB) |
| `SocialMediaEmbedder.jsx` | Multi-platform embeds |
| `Comments.jsx` | Firebase-powered comments |

### Cricket Components
| Component | Purpose |
|-----------|---------|
| `ShowCricket.jsx` | Cricket section entry |
| `MatchList.jsx` | Live/recent matches |
| `Scorecard.jsx` | Detailed match score |
| `MatchTable.js` | Desktop match table |
| `MobileMatchTable.js` | Mobile-optimized table |

### Schema Components
| Component | Purpose |
|-----------|---------|
| `ArticleSchema.js` | Article structured data |
| `BreadcrumbSchema.js` | Navigation breadcrumbs |
| `OrganizationSchema.js` | Business info |

---

## 🗄️ Services Layer

### Primary Service: [services/index.js](file:///Users/shanumac/Documents/dev2/nextJs/vk_blog/services/index.js)

| Function | Purpose |
|----------|---------|
| `getPosts(options)` | Paginated posts with filtering |
| `getPostDetails(slug)` | Single post with full content |
| `getCategories()` | All categories |
| `getSimilarPosts()` | Related posts by category |
| `getAdjacentPosts()` | Previous/next navigation |
| `getCategoryPost(slug)` | Posts by category |
| `getFeaturedPosts()` | Featured posts for hero |
| `getRecentPosts()` | Latest posts widget |

### Hygraph Service: [services/hygraph.js](file:///Users/shanumac/Documents/dev2/nextJs/vk_blog/services/hygraph.js)

| Function | Purpose |
|----------|---------|
| `fetchFromCDN()` | Read-only cached queries |
| `fetchFromContentAPI()` | Mutation-capable queries |
| `batchQueries()` | Parallel query execution |
| `prefetchCommonQueries()` | Idle-time data prefetch |
| `optimizeImageUrls()` | CDN image optimization |

### Comment Services
- `commentService.js` - Primary comment CRUD
- `commentServiceUnified.js` - Multi-source comments
- `commentServiceProxy.js` - API proxy layer
- `commentServiceFallback.js` - Graceful degradation

---

## 🎣 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useHomepageData.js` | Homepage data fetching |
| `useApolloQueries.js` | GraphQL query management |
| `useCricketData.js` | Live cricket data |
| `useMatchData.js` | Individual match details |
| `useInfiniteScroll.js` | Pagination scroll |
| `useAnalytics.js` | Analytics tracking |
| `useApiLoading.js` | Loading state management |
| `useTwitter.js` | Twitter embed handling |
| `useCacheMonitor.js` | Cache performance |

---

## ⚡ Performance Optimizations

### Image Handling
- AVIF/WebP automatic format conversion
- Responsive srcset with 9 device sizes
- 7-day image cache TTL
- CDN-based optimization via Hygraph

### Caching Strategy
```javascript
// Apollo Client: In-memory + localStorage
// Hygraph: CDN layer + custom cache manager
// Vercel: Edge caching with stale-while-revalidate
// Images: 1-year static asset caching
```

### Code Splitting
- Dynamic imports for heavy components
- Carousel lazy loading
- Framework/vendor chunk separation
- Package import optimization

### Production Optimizations
- Console removal (except errors/warnings)
- React properties removal
- SWC minification
- Disabled source maps

---

## 🚀 Deployment Configuration

### Vercel Settings ([vercel.json](file:///Users/shanumac/Documents/dev2/nextJs/vk_blog/vercel.json))

| Setting | Value |
|---------|-------|
| Region | `bom1` (Mumbai) |
| Framework | Next.js |
| Output | Standalone |

### Cache Headers
| Asset Type | Cache Duration |
|------------|----------------|
| Static assets | 1 year |
| HTML pages | No cache |
| API routes | 60s + 5min stale |
| Images | 1 day + 7 day stale |

### Rewrites
- `/sitemap.xml` → `/api/sitemap`
- `/sitemap-news.xml` → `/api/sitemap-news`
- `/blog` → `/` (homepage)

---

## 🛡️ Security Features

### Content Security Policy
- Frame sources: YouTube, Twitter, Facebook, Instagram
- Script sources: Analytics, Firebase, Clarity
- Image sources: Hygraph CDN, Twitter CDN
- Connect sources: All external APIs

### Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📈 Monitoring & Analytics

### Integrated Services
| Service | Purpose |
|---------|---------|
| Google Analytics 4 | User analytics |
| Sentry | Error tracking |
| Web Vitals | Core Web Vitals |
| Microsoft Clarity | Session recordings |

### Health Check Endpoints
- `/api/health` - System status
- `/api/monitoring` - Performance metrics

---

## 🔔 Notification System

### Telegram Integration
1. CMS publishes new post
2. Webhook triggers `/api/hygraph-telegram-webhook`
3. Formatted message sent to Telegram channel

### Discord Integration
- Contact form submissions
- Error notifications (optional)

---

## 📜 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run build:analyze` | Bundle analysis |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript validation |
| `npm run postbuild` | Sitemap generation |

### Utility Scripts ([/scripts](file:///Users/shanumac/Documents/dev2/nextJs/vk_blog/scripts))
- `deploy-production.sh` - Production deployment
- `validate-production.sh` - Production validation
- `analyze-performance.js` - Performance audit
- `validate-seo-health.js` - SEO health check
- `test-metatags.js` - Meta tags validation
- `optimize-images.js` - Image optimization

---

## 📚 Documentation

Existing documentation in project root:
- `HygraphNextJSConfiguration.md` - CMS setup guide
- `SENTRY_INTEGRATION.md` - Error tracking setup
- `TELEGRAM_INTEGRATION_GUIDE.md` - Notification setup
- `TWITTER_INTEGRATION.md` - Twitter embeds
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Release checklist
- `CACHING.md` - Caching strategy
- `DEEP_PERFORMANCE_AUDIT_2025.md` - Performance audit

---

## 🎯 Admin Website Integration Points

### Content Management
```javascript
// Fetch posts for admin dashboard
import { getPosts } from '@/services';
const posts = await getPosts({ first: 50, skip: 0 });

// Get post analytics
import { getPostDetails } from '@/services';
const post = await getPostDetails(slug);
```

### Real-time Data
```javascript
// Cricket scores (external API)
const response = await fetch('/api/cricket-proxy?type=recent');

// Comments management
import { getComments, submitComment } from '@/services/commentService';
```

### Webhooks for Admin
- `/api/health` - Monitor system status
- `/api/monitoring` - Performance metrics
- `/api/hygraph-telegram-webhook` - Content events

### Environment for Admin Panel
```bash
# Required for admin operations
HYGRAPH_AUTH_TOKEN=<for mutations>
FIREBASE_ADMIN_SDK=<for user management>
```

---

## ⚠️ Important Notes for Admins

### Rate Limits
- Hygraph: Based on plan (check dashboard)
- Twitter API: 300 requests/15 min window
- Firebase: Based on Spark/Blaze plan

### Known Considerations
1. **Comments**: Uses Firebase Firestore - check security rules
2. **Cricket API**: External dependency - may have downtime
3. **Image Processing**: Sharp library requires binary compatibility
4. **Cache Invalidation**: Use ISR revalidation endpoints

### Recommended Admin Tasks
- [ ] Monitor Sentry for errors weekly
- [ ] Check Google Analytics for traffic anomalies
- [ ] Review Hygraph usage/limits monthly
- [ ] Update dependencies quarterly
- [ ] Rotate API tokens annually

---

## 📞 Quick Reference

| Need | Location |
|------|----------|
| Add new page | `/pages/[name].jsx` |
| Add API route | `/pages/api/[name].js` |
| Add component | `/components/[Name].jsx` |
| Add hook | `/hooks/use[Name].js` |
| Modify CMS queries | `/services/index.js` |
| Update cache | `/lib/cache-manager.js` |
| Change styles | `/styles/globals.scss` |
| Add env var | `.env.local` + `vercel.json` |

---

*Report generated by analyzing 190+ files across 22 directories.*
