# urTechy Blogs — Project Context

## Overview

**urTechy Blogs** is a production blog platform at [blog.urtechy.com](https://blog.urtechy.com/) built with **Next.js 14** (Pages Router), **Hygraph CMS** (GraphQL), **Tailwind CSS**, and **Framer Motion**. It serves content across technology, entertainment, sports, and more, with a live cricket scores feature. Deployed on **Vercel** (bom1/Mumbai region).

**Author:** Vaibhav ([LinkedIn](https://www.linkedin.com/in/shanuv000/))

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (React 18, Pages Router) |
| Language | JavaScript/JSX (TypeScript config present but primarily JS) |
| Styling | Tailwind CSS 3.4 + SCSS + CSS Modules |
| CMS | Hygraph (GraphCMS) via GraphQL |
| Data Fetching | `graphql-request`, `@apollo/client` |
| Animation | Framer Motion |
| Images | Cloudinary (custom loader), Next.js `<Image>` |
| Icons | FontAwesome, React Icons, Lucide, Iconify |
| State | React Context API (minimal global state) |
| Error Tracking | Sentry |
| Analytics | Google Analytics, Microsoft Clarity, Firebase Analytics |
| Database | Firebase (contact form, analytics) |
| Deployment | Vercel (standalone output) |
| SEO | next-seo, next-sitemap, JSON-LD schemas |

---

## Project Structure

```
├── pages/                  # Next.js pages (routes) + API routes
│   ├── _app.js             # App wrapper: ApolloProvider, ErrorBoundary, AnalyticsProvider, Layout
│   ├── _document.js        # Custom HTML document
│   ├── index.jsx           # Homepage with SSG + ISR (revalidate: 300s)
│   ├── post/[slug].js      # Dynamic blog post pages (SSG + ISR: 60s)
│   ├── category/[slug].js  # Category archive pages (SSG + ISR)
│   ├── about.jsx            # About page
│   ├── contact.jsx          # Contact form (Firebase backend)
│   ├── search.jsx           # Search page
│   ├── livecricket.jsx      # Live cricket scores (isolated CricketDataContext)
│   ├── terms.jsx            # Terms & conditions
│   └── api/                 # 25+ API routes
│       ├── hygraph-proxy.js              # Hygraph GraphQL proxy (CORS bypass)
│       ├── cricket-proxy.js              # Cricket data proxy
│       ├── firebase-proxy.js             # Firebase proxy (comments, contact)
│       ├── hygraph-telegram-webhook.js   # Webhook: Hygraph → Telegram notifications
│       ├── sitemap.js / sitemap-news.js  # Dynamic sitemaps
│       ├── search.js                     # Server-side search
│       ├── health.js / monitoring.js     # Health checks & monitoring
│       ├── scores/                       # Cricket score endpoints
│       └── twitter/                      # Twitter/X embed endpoints
├── components/             # 83+ React components
│   ├── index.js            # Barrel file (re-exports key components)
│   ├── Layout.jsx          # Main layout wrapper (Header + children + Footer)
│   ├── Header.jsx          # Navigation with dynamic categories, search, mobile menu
│   ├── PostDetail.jsx      # Full blog post view (lazy-loads Comments, FAQ, SocialMediaEmbedder)
│   ├── RichTextRenderer.jsx # Hygraph rich text → React (1600+ lines, handles embeds)
│   ├── PostCard.jsx        # Blog post card component
│   ├── OptimizedHomepage.jsx # Production homepage component
│   ├── HeroSpotlight.jsx   # Featured post hero section
│   ├── FeaturedHeroCarousel.jsx # Featured posts carousel
│   ├── Comments.jsx        # Comment system (Firebase-backed)
│   ├── SocialMediaEmbedder.jsx # Twitter, Instagram, Facebook, YouTube, Spotify embeds
│   ├── SearchModal.jsx     # Search overlay
│   ├── Cricket/            # Cricket score display components
│   ├── Blog/               # Blog-specific sub-components
│   ├── footer/             # Footer components
│   └── *Schema.js          # JSON-LD structured data (Article, Breadcrumb, Organization, etc.)
├── services/               # Data fetching & API layer
│   ├── index.js            # Main service: getPosts, getPostDetails, getCategories, etc.
│   ├── hygraph.js          # Hygraph GraphQL clients (CDN + Content API), caching, prefetch
│   ├── pagination.js       # SSG pagination with offset-based queries
│   ├── commentService*.js  # Comment CRUD (multiple implementations: proxy, REST, fallback)
│   ├── contactService.js   # Contact form submission service
│   ├── telegramService.js  # Telegram notification service
│   ├── twitterService.js   # Twitter/X oEmbed service
│   ├── apollo-services.js  # Apollo-specific query wrappers
│   └── direct-api.js       # Direct Hygraph API calls
├── lib/                    # Core utilities & clients
│   ├── apollo-client.js    # Apollo Client setup (InMemoryCache, RetryLink, ErrorLink)
│   ├── cache-manager.js    # In-memory cache with TTL
│   ├── cloudinary-loader.js # Custom Next.js image loader for Cloudinary
│   ├── firebase.js         # Firebase initialization
│   ├── cors.js             # CORS middleware for API routes
│   ├── analytics.js        # Analytics utilities
│   ├── request-deduplicator.js # Deduplicates concurrent identical requests
│   └── tweet-embed-config.js   # Tweet embed configuration
├── hooks/                  # Custom React hooks
│   ├── useHomepageData.js  # Homepage data fetching
│   ├── useInfiniteScroll.js # Infinite scroll pagination
│   ├── useApolloQueries.js # Apollo query hooks
│   ├── useCricketData.js   # Cricket data hook
│   ├── useSearch.js        # Search functionality
│   ├── useTwitter.js       # Twitter embed hook
│   └── useAnalytics.js     # Analytics tracking
├── store/                  # React Context providers
│   ├── HandleApiContext.js     # Minimal global context (empty, kept for extensibility)
│   ├── CricketDataContext.js   # Cricket data with visibility-aware polling (isolated to /livecricket)
│   └── LazyDataProvider.jsx    # Lazy-loaded data provider
├── utils/                  # Helper functions
│   ├── categoryHierarchy.js    # Category tree structure & navigation
│   ├── postValidation.js       # Post content validation
│   ├── imageUtils.js           # Image dimension extraction
│   ├── readingTime.js          # Reading time calculator
│   └── renderedTweets.js       # Tweet deduplication registry
├── styles/                 # Global styles
│   ├── globals.scss         # Main global styles (dark theme, gradients)
│   ├── medium-typography.css # Medium-inspired typography
│   ├── critical.css         # Critical above-fold CSS
│   └── HeroSpotlight.module.css # CSS Module for HeroSpotlight
├── config/
│   └── production.js       # Production-specific configuration
├── sections/               # Page section components (AdjacentPosts, FeaturedPosts)
├── scripts/                # 46 utility/maintenance scripts
├── docs/                   # Internal documentation
├── public/                 # Static assets (icons, logos, images)
└── __tests__/              # Test files
```

---

## Architecture & Data Flow

### Data Fetching Strategy

1. **SSG + ISR** (primary): Pages use `getStaticProps` with `revalidate`. Homepage revalidates every 300s, posts every 60s.
2. **Dual GraphQL Clients**:
   - **CDN Client** (`cdnClient`): Read-only queries via `ap-south-1.cdn.hygraph.com` — cached, fast, used for most reads.
   - **Content Client** (`contentClient`/`authClient`): Authenticated mutations via `api-ap-south-1.hygraph.com` — used for comments, writes.
3. **Apollo Client**: Full InMemoryCache with type policies, RetryLink (3 retries), ErrorLink, and custom merge/read functions for pagination and post caching.
4. **In-memory caching** (`lib/cache-manager.js`): TTL-based cache for GraphQL responses, complementing Apollo cache.
5. **Request deduplication** (`lib/request-deduplicator.js`): Prevents duplicate concurrent requests.
6. **Client-side fetching**: Used only for dynamic data (cricket scores via `/api/cricket-proxy`).

### State Management

- **ApolloProvider** wraps the entire app for GraphQL cache.
- **HandleApiContext**: Minimal/empty global context (cricket data moved to isolated context).
- **CricketDataContext**: Only mounted on `/livecricket` page. Uses visibility-aware polling (pauses when tab is hidden, 60s refresh interval).
- Components use local `useState`/`useEffect` for most state.

### Image Optimization

- **Cloudinary custom loader** (`lib/cloudinary-loader.js`): All images routed through Cloudinary (`res.cloudinary.com`) for automatic format conversion (AVIF/WebP via `f_auto`), quality optimization, and resizing. 25K free transforms/mo vs Vercel's 5K limit.
- Remote patterns configured for: Hygraph, Cloudinary, Unsplash, AWS S3, Twitter, Cricbuzz.
- Extended cache TTL: 7 days (`minimumCacheTTL: 604800`).

---

## Key Patterns & Conventions

### Component Patterns

- **Barrel exports** via `components/index.js` — import from `../components`.
- **Dynamic imports** (`next/dynamic`) for heavy components: Comments, SocialMediaEmbedder, FAQ (with `ssr: false` where needed).
- **Error boundaries** wrap the entire app.
- **Framer Motion** for animations (fadeIn, slideUp, scroll-based progress bars).
- `RichTextRenderer.jsx` (1683 lines) is the core content renderer — handles Hygraph rich text including embedded tweets, YouTube, Instagram, Facebook, Spotify, code blocks with syntax highlighting, tables, and images.

### Service Layer

- `services/index.js` exports the main query functions: `getPosts`, `getPostDetails`, `getCategories`, `getSimilarPosts`, `getAdjacentPosts`, `getCategoryPost`, `getFeaturedPosts`, `getRecentPosts`, `getCategoriesWithPosts`, `getPopularPosts`.
- All queries use `fetchFromCDN()` from `services/hygraph.js` which handles caching, error handling, and performance monitoring.
- Comment system has multiple fallback implementations (unified → proxy → REST → fallback).

### Styling

- **Dark theme** by default — backgrounds are `#0A0A0A`/`#141414`, text is `#F5F5F5`/`#D4D4D4`.
- **Brand colors**: Primary red `#E50914`, orange `#FF8C00`, tomato `#FF6347`.
- **Fonts**: Inter (body), Poppins (headings), JetBrains Mono (code).
- **Tailwind Typography plugin** (`@tailwindcss/typography`) with custom dark theme prose styles.
- Uses both Tailwind utility classes and SCSS (`globals.scss`) for global styles.

### SEO

- `next-seo` for per-page meta tags and Open Graph.
- JSON-LD schemas: `ArticleSchema`, `BreadcrumbSchema`, `OrganizationSchema`, `WebsiteSchema`, `ListItemSchema`.
- `next-sitemap` generates sitemaps + robots.txt. News sitemap at `/sitemap-news.xml`.
- Site URL: `https://blog.urtechy.com`.

---

## Environment Variables

Key variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_HYGRAPH_CONTENT_API` | Hygraph Content API (mutations) |
| `NEXT_PUBLIC_HYGRAPH_CDN_API` | Hygraph CDN API (read-only) |
| `HYGRAPH_AUTH_TOKEN` | Hygraph authentication token |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | Google Analytics measurement ID |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase configuration (6 vars) |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Sentry error tracking |
| `TINYURL_API_KEY` | URL shortening for social sharing |
| `AI_UPDATE_SECRET` | Cron job authentication |

Legacy aliases: `NEXT_PUBLIC_GRAPHCMS_ENDPOINT` → `NEXT_PUBLIC_HYGRAPH_CONTENT_API`, `GRAPHCMS_TOKEN` → `HYGRAPH_AUTH_TOKEN`.

---

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (runs next-sitemap postbuild)
npm run start        # Start production server
npm run lint         # ESLint check
npm run analyze      # Bundle analysis (ANALYZE=true)
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

---

## Build & Deploy

- **Vercel** deployment with `standalone` output mode.
- Region: `bom1` (Mumbai, India).
- ESLint ignored during builds (`eslint.ignoreDuringBuilds: true`).
- Console logs stripped in production (except `error`/`warn`).
- Source maps disabled in production.
- Webpack chunk splitting: framework (React), commons, per-npm-package chunks.
- Package imports optimized: `react-icons`, `lucide-react`, `framer-motion`, `date-fns`.
- Cache headers in `vercel.json`: static assets 1yr, HTML no-cache, API routes 60s + stale-while-revalidate.

---

## Important Files for Common Tasks

| Task | Key Files |
|---|---|
| Add a new page | `pages/` — create new `.jsx` file |
| Add a new component | `components/` + update `components/index.js` barrel |
| Modify blog post rendering | `components/RichTextRenderer.jsx`, `components/PostDetail.jsx` |
| Add GraphQL query | `services/index.js`, `services/hygraph.js` |
| Modify navigation | `components/Header.jsx`, `utils/categoryHierarchy.js` |
| Add API route | `pages/api/` |
| Update styles | `tailwind.config.js`, `styles/globals.scss` |
| Configure images | `next.config.js` (remotePatterns), `lib/cloudinary-loader.js` |
| SEO changes | `components/*Schema.js`, `components/Seo.js`, `next-sitemap.config.js` |
| Homepage layout | `components/OptimizedHomepage.jsx`, `pages/index.jsx` |
| Cricket features | `components/Cricket/`, `store/CricketDataContext.js`, `pages/livecricket.jsx` |
| Comments system | `components/Comments.jsx`, `services/commentService*.js` |

---

## Code Quality

- **ESLint**: Extends `next/core-web-vitals` + `next/typescript`. Strict rules: `no-unused-vars` (error), `prefer-const`, `eqeqeq`, `import/order`. Console warnings allowed only in API routes.
- **TypeScript**: `tsconfig.json` present, `strict: false`, primarily JS codebase with TS checking available via `npm run type-check`.
- **Prettier** configured via ESLint plugin.

---

## Gotchas & Notes

1. **Pages Router** (not App Router) — routing is in `pages/`, not `app/`.
2. **Mixed JS/JSX** — some files are `.js`, others `.jsx`. Both work with the same config.
3. **RichTextRenderer is massive** (1683 lines) — handles all Hygraph rich text rendering including social media embeds. Changes here need careful testing.
4. **Dual caching layers** — Apollo InMemoryCache + custom `cache-manager.js`. Be aware of both when debugging stale data.
5. **Cricket data is isolated** — only loads on `/livecricket` via `CricketDataContext`. Don't add cricket API calls to the global context.
6. **Image optimization via Cloudinary** — not Vercel's built-in optimizer. The custom loader in `lib/cloudinary-loader.js` controls all image URLs.
7. **Comment service has multiple fallback layers** — unified → proxy → REST → fallback. Check `services/commentServiceUnified.js` first.
8. **Many root `.md` files** — these are historical reports/docs, not part of the build. The codebase has 100+ documentation markdown files at root level.
9. **`components/index.js`** barrel file doesn't export all 83+ components — only the most commonly shared ones. Many components are imported directly.
10. **Hygraph field name**: The featured post boolean field is `featuredpost` (no underscore/camelCase).
