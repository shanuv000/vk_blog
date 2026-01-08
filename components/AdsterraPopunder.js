import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Smart Adsterra Anti-Adblock Popunder Component
 * 
 * Uses Adsterra's anti-adblock script that bypasses carrier-level blocking (like Jio).
 * 
 * Features:
 * - Anti-adblock technology
 * - Session-based frequency cap
 * - Page exclusions
 * - Engagement delay
 * - Mobile exclusion (optional)
 */
const AdsterraPopunder = ({
    // Anti-adblock script URL from Adsterra
    scriptUrl = "https://openairtowhardworking.com/d2/ec/38/d2ec385d28d06dcda520b6866b029b4b.js",
    delaySeconds = 15,
    excludedPages = ['/contact', '/about', '/terms', '/search', '/admin'],
    excludeMobile = true,
    excludeFirstVisit = false,
}) => {
    const [shouldShowAd, setShouldShowAd] = useState(false);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        // Check 1: Already shown this session?
        if (sessionStorage.getItem('adsterra_popunder_shown')) {
            return;
        }

        // Check 2: Excluded pages
        const currentPath = window.location.pathname;
        if (excludedPages.some(page => currentPath === page || currentPath.startsWith(`${page}/`))) {
            return;
        }

        // Check 3: Mobile detection (optional)
        if (excludeMobile) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || window.innerWidth < 768;
            if (isMobile) return;
        }

        // Check 4: First-visit protection
        if (excludeFirstVisit) {
            if (!localStorage.getItem('urtechy_returning_visitor')) {
                localStorage.setItem('urtechy_returning_visitor', 'true');
                return;
            }
        }

        // Wait before showing
        const timer = setTimeout(() => {
            // Final page check
            const finalPath = window.location.pathname;
            if (excludedPages.some(page => finalPath === page || finalPath.startsWith(`${page}/`))) {
                return;
            }

            setShouldShowAd(true);
            sessionStorage.setItem('adsterra_popunder_shown', 'true');
        }, delaySeconds * 1000);

        return () => clearTimeout(timer);
    }, [delaySeconds, excludedPages, excludeMobile, excludeFirstVisit]);

    if (!shouldShowAd) return null;

    return (
        <Script
            src={scriptUrl}
            strategy="afterInteractive"
        />
    );
};

export default AdsterraPopunder;
