import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

/**
 * Adsterra Native Banner Ad Component
 * 
 * Features:
 * - Lazy loading: Only loads when scrolled into view
 * - Mobile-aware: Works on all devices
 * - Non-intrusive: Blends with content
 * - Performance optimized: Uses Intersection Observer for lazy loading
 * 
 * Best placements:
 * - After article content (primary)
 * - Between posts on homepage
 * - Below related posts
 * 
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.lazyLoad=true] - Whether to lazy load the ad
 * @param {number} [props.lazyLoadOffset=200] - Pixels before viewport to start loading
 */
const NativeBannerAd = ({
    className = '',
    lazyLoad = true,
    lazyLoadOffset = 200,
}) => {
    const containerRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Container ID for Adsterra
    const containerId = 'container-1f24392931355411bbd46ad36048cd1a';
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        // Skip if not lazy loading or already triggered
        if (!lazyLoad || shouldLoad) return;

        // Skip on server
        if (typeof window === 'undefined' || !containerRef.current) return;

        // Use Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log('[NativeBannerAd] In viewport, loading ad...');
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: `${lazyLoadOffset}px`,
                threshold: 0,
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [lazyLoad, shouldLoad, lazyLoadOffset]);

    return (
        <div
            ref={containerRef}
            className={`native-banner-ad-wrapper ${className}`}
            style={{
                minHeight: shouldLoad ? 'auto' : '100px', // Reserve space to prevent layout shift
            }}
        >
            {/* Ad container - styled to blend with content */}
            <div
                className="native-banner-container"
                style={{
                    margin: '2rem 0',
                    padding: '1rem 0',
                    borderTop: '1px solid var(--border-color, #e5e7eb)',
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                }}
            >
                {/* Optional label for transparency */}
                <div
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary, #6b7280)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                    }}
                >
                    Sponsored Content
                </div>

                {/* Adsterra container */}
                <div id={containerId}></div>

                {/* Load script only when shouldLoad is true */}
                {shouldLoad && !hasLoaded && (
                    <Script
                        src={scriptUrl}
                        strategy="lazyOnload"
                        async
                        data-cfasync="false"
                        onLoad={() => {
                            console.log('[NativeBannerAd] Script loaded successfully');
                            setHasLoaded(true);
                        }}
                        onError={(e) => {
                            console.error('[NativeBannerAd] Script failed to load:', e);
                        }}
                    />
                )}
            </div>

            <style jsx>{`
        .native-banner-ad-wrapper {
          width: 100%;
          overflow: hidden;
        }
        
        .native-banner-container {
          max-width: 100%;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .native-banner-container {
            border-color: #374151;
          }
        }
      `}</style>
        </div>
    );
};

export default NativeBannerAd;
