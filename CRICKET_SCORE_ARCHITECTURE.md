# Cricket Score System Architecture

> **Single Source of Truth**: This document reflects the authoritative state of the cricket score pipeline. if production behavior differs, this document must be updated.

## 1. System Overview
The cricket score system is a **backend-authoritative** pipeline that proxies external API data to the frontend. The frontend (Next.js) **never** communicates directly with external cricket providers. All data flows through `pages/api/cricket-proxy.js`.

**Key Philosophy**:
- **Zero Client Trust**: Frontend only displays what provided.
- **Lazy Loading**: Cricket data is only fetched on the `/livecricket` route.
- **Failover Safe**: Multiple providers are tried in sequence.

## 2. API & Data Sources

### Primary Provider
- **Endpoint**: `https://drop.urtechy.com/api/cricket/{endpoint}`
- **Status**: **Active / Authoritative**
- **Timeouts**: 10 seconds

### Backup Providers
- **Secondary**: `https://cricket-live-data.p.rapidapi.com/{endpoint}`
- **Status**: **Authentication Required (401)** - Currently failing without valid API key headers.
- **Timeouts**: 8 seconds

### API Routes (Internal Proxy)
The application exposes a single proxy endpoint: `/api/cricket-proxy`.

| Query Param (`endpoint`) | Description | Data Transformation |
|--------------------------|-------------|---------------------|
| `schedule` | Upcoming match fixtures | **Inactive / 404** (Needs upstream fix) |
| `live-scores` | Real-time match data | Heading/Tournament extraction |
| `recent-scores` | Past match results | Limited to top 20 results |
| `upcoming-matches` | Near-future games | Heading extraction |
| `series` | Series List | Active (Contains references to points tables) |

## 3. Caching Strategy
Caching is enforced at the **Server Proxy Level** to protect external rate limits and improve performance.

**Headers Configured**:
```http
Cache-Control: public, s-maxage=120, stale-while-revalidate=600, max-age=60
X-Cricket-API-Optimized: true
```

- **s-maxage=120**: Vercel Edge Cache holds data for 2 minutes.
- **stale-while-revalidate=600**: Stale data served for up to 10 minutes while background update occurs.
- **max-age=60**: Browser cache holds data for 1 minute.

## 4. Frontend Consumption Logic
Data consumption is isolated to the `CricketDataProvider` in `store/CricketDataContext.js`.

### Polling Mechanism
- **Interval**: 60 seconds (`LIVE_REFRESH_INTERVAL`)
- **Visibility Awareness**:
  - Polling **stops** when the tab/window is hidden.
  - Polling **resumes** immediately when the tab becomes visible.

### Context Isolation
- **Provider**: `LazyDataProvider` inside `components/Layout.jsx`
- **Logic**: The cricket context is **only imported and mounted** when the route is exactly `/livecricket`.
- **Global Header**: Uses `useIsLiveCricket()` hook which safely checks for context existence without crashing on non-cricket pages.

## 5. Data Transformation
The backend proxy (`pages/api/cricket-proxy.js`) performs "Heading Extraction" to categorize matches (e.g., "T20 Matches", "ODI Matches") before sending to the client. This ensures the frontend doesn't need complex categorization logic.

## 6. Known Issues / Maintenance Notes
- **Broken Endpoint**: The `/schedule` endpoint on the primary provider (`drop.urtechy.com`) returns **404**.
- **Impacted Components**: 
  - `components/Cricket/MatchTable.js` (Desktop Points Table)
  - `components/Cricket/MobileMatchTable.js` (Mobile Points Table)
- **Status**: These components will fail to load data. The `series` endpoint is available and contains `pointsTableUrl`, but frontend refactoring is required to utilize it (e.g., selecting a specific series).

---

**Version**: 1.1
**Last Updated**: 2026-01-29
**Change Log**:
- Initial documentation creation.
- Updated Primary API Endpoint to `drop.urtechy.com`.
- Verified endpoints: `schedule` is 404, `live-scores`/`recent`/`upcoming` are 200.
- Marked Backup Provider as requiring authentication (401).
- Documented broken Points Table functionality.
