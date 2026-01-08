import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

/**
 * Smart Adsterra Popunder Component
 * 
 * Features:
 * 1. Session-based frequency cap - Only shows once per session
 * 2. Page exclusions - Doesn't show on sensitive pages (contact, about, terms)
 * 3. Engagement delay - Only shows after user has spent 30s on site
 * 4. Mobile exclusion - Skips popunder on mobile devices (better UX + Google compliance)
 * 5. First-visit protection - Doesn't show to first-time visitors
 * 
 * @param {Object} props
 * @param {string} props.scriptUrl - Adsterra script URL
 * @param {number} [props.delaySeconds=30] - Seconds to wait before enabling popunder
 * @param {string[]} [props.excludedPages] - Array of page paths to exclude
 * @param {boolean} [props.excludeMobile=true] - Whether to exclude mobile devices
 * @param {boolean} [props.excludeFirstVisit=true] - Whether to exclude first-time visitors
 */
const AdsterraPopunder = ({
    scriptUrl = "https://pl28427626.effectivegatecpm.com/d2/ec/38/d2ec385d28d06dcda520b6866b029b4b.js",
    delaySeconds = 30,
    excludedPages = ['/contact', '/about', '/terms', '/search', '/admin'],
    excludeMobile = true,
    excludeFirstVisit = true,
}) => {
    const [shouldShowAd, setShouldShowAd] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Check 1: Session frequency cap - already shown this session?
        if (sessionStorage.getItem('adsterra_popunder_shown')) {
            console.log('[AdsterraPopunder] Skipped: Already shown this session');
            return;
        }

        // Check 2: Excluded pages
        const currentPath = router.pathname;
        const isExcludedPage = excludedPages.some(page =>
            currentPath === page || currentPath.startsWith(`${page}/`)
        );
        if (isExcludedPage) {
            console.log('[AdsterraPopunder] Skipped: Excluded page -', currentPath);
            return;
        }

        // Check 3: Mobile device detection
        if (excludeMobile) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || window.innerWidth < 768;

            if (isMobile) {
                console.log('[AdsterraPopunder] Skipped: Mobile device detected');
                return;
            }
        }

        // Check 4: First-time visitor protection
        if (excludeFirstVisit) {
            const hasVisitedBefore = localStorage.getItem('urtechy_returning_visitor');
            if (!hasVisitedBefore) {
                // Mark as returning visitor for next time
                localStorage.setItem('urtechy_returning_visitor', 'true');
                console.log('[AdsterraPopunder] Skipped: First-time visitor');
                return;
            }
        }

        // Check 5: Engagement delay - wait for user to spend time on site
        console.log(`[AdsterraPopunder] Waiting ${delaySeconds}s for user engagement...`);

        const engagementTimer = setTimeout(() => {
            // Double-check we're still on an allowed page
            const finalPath = window.location.pathname;
            const stillExcluded = excludedPages.some(page =>
                finalPath === page || finalPath.startsWith(`${page}/`)
            );

            if (stillExcluded) {
                console.log('[AdsterraPopunder] Skipped: User navigated to excluded page');
                return;
            }

            // All checks passed - show the ad
            console.log('[AdsterraPopunder] ✓ All checks passed, loading popunder script');
            setShouldShowAd(true);

            // Mark as shown for this session
            sessionStorage.setItem('adsterra_popunder_shown', 'true');
            sessionStorage.setItem('adsterra_popunder_shown_at', new Date().toISOString());
        }, delaySeconds * 1000);

        // Cleanup timer on unmount or route change
        return () => {
            clearTimeout(engagementTimer);
        };
    }, [router.pathname, delaySeconds, excludedPages, excludeMobile, excludeFirstVisit]);

    // Don't render anything if conditions aren't met
    if (!shouldShowAd) {
        return null;
    }

    return (
        <Script
            src={scriptUrl}
            strategy="afterInteractive"
            onLoad={() => {
                console.log('[AdsterraPopunder] Script loaded successfully');
            }}
            onError={(e) => {
                console.error('[AdsterraPopunder] Script failed to load:', e);
            }}
        />
    );
};

export default AdsterraPopunder;
