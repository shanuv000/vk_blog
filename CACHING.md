# Caching Configuration Guide

This document outlines the caching strategy implemented in the urTechy Blogs application to improve performance and reduce API calls.

## Caching Layers

The application uses multiple caching layers:

1. **Apollo Client Cache** - Client-side in-memory cache for GraphQL queries
2. **Service Worker Cache** - Browser-level cache for offline support and performance
3. **HTTP Cache** - Standard browser cache controlled by HTTP headers
4. **Next.js Image Cache** - Optimized image caching

## Apollo Client Cache Configuration

Apollo Client is configured with type policies that define caching behavior for different types of data:

| Data Type | Cache Duration | Strategy |
|-----------|---------------|----------|
| Posts | 6 hours | cache-first |
| Categories | 12 hours | cache-first |
| Images | 48 hours | cache-first |
| Default | 4 hours | cache-first |

The Apollo Client is configured in `lib/apollo-client.js` with:
- Type-specific caching policies
- Custom merge functions for handling arrays and missing data
- Debug mode for monitoring cache hits/misses

## Service Worker Cache (PWA)

The service worker caching is configured in `next.config.js` with different strategies:

| Resource Type | Strategy | Duration | Notes |
|---------------|----------|----------|-------|
| Hygraph API | NetworkFirst | 15 minutes | Falls back to cache after 10s timeout |
| Hygraph Proxy | StaleWhileRevalidate | 30 minutes | Updates cache in background |
| Images | CacheFirst | 60 days | Prioritizes cached images |
| Static Resources | StaleWhileRevalidate | 7 days | Updates in background |
| API Routes | NetworkFirst | 5 minutes | Except revalidation endpoints |
| Default | NetworkFirst | 4 hours | For all other resources |

## HTTP Cache Headers

API routes set appropriate cache headers:

| API Route | Cache Duration | Strategy |
|-----------|---------------|----------|
| /api/hygraph-proxy (categories) | 1 day | stale-while-revalidate=2 days |
| /api/hygraph-proxy (featured/recent) | 15 minutes | stale-while-revalidate=2 hours |
| /api/hygraph-proxy (post details) | 30 minutes | stale-while-revalidate=4 hours |
| /api/hygraph-proxy (default) | 5 minutes | stale-while-revalidate=1 hour |
| /api/default-image | 1 year | immutable |

## Next.js Image Optimization

Next.js Image component is configured with:

- `minimumCacheTTL`: 24 hours (86400 seconds)
- Support for multiple image formats (avif, webp)
- Remote patterns for flexible image sources

## Debugging Tools

Several debugging tools are available:

1. **Cache Test Page** (`/cache-test`) - Test and monitor caching
2. **Apollo Debug Mode** - Enable with `enableApolloDebug()`
3. **Cache Debug Component** - Monitor service worker and HTTP cache
4. **API Cache Status** (`/api/cache-status`) - Check HTTP cache headers

## Best Practices

1. **Use Apollo Client for GraphQL queries** - Leverage the built-in caching
2. **Prefer the Image component** - For automatic optimization and caching
3. **Use appropriate fetch policies** - `cache-first` for most queries, `network-only` for time-sensitive data
4. **Monitor cache performance** - Use the debug tools to identify issues

## Troubleshooting

If caching is not working as expected:

1. Check browser developer tools Network tab for cache hits/misses
2. Verify service worker is registered and active
3. Use the Cache Test page to diagnose issues
4. Check Apollo Client cache with Apollo DevTools
5. Verify HTTP cache headers are being set correctly

## Further Optimization

Consider these additional optimizations:

1. Implement server-side caching with Redis or Memcached
2. Use Incremental Static Regeneration for frequently accessed pages
3. Implement edge caching with a CDN
4. Add cache warming for critical resources
5. Add cache analytics to monitor hit rates and optimize TTLs
