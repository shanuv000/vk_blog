import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Adsterra Native Banner Ad Component
 * 
 * Simple, reliable native banner ad that loads after article content.
 * Uses forced visibility styles to prevent adblocker CSS from hiding it.
 */
const NativeBannerAd = ({ className = '' }) => {
    const [mounted, setMounted] = useState(false);

    const containerId = 'container-1f24392931355411bbd46ad36048cd1a';
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            className={`native-banner-wrapper ${className}`}
            style={{
                margin: '32px 0',
                padding: '24px 0',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                textAlign: 'center',
                display: 'block',
                visibility: 'visible',
                opacity: 1,
            }}
        >
            {/* Label */}
            <div
                style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '16px',
                }}
            >
                Sponsored Content
            </div>

            {/* Ad container */}
            <div
                id={containerId}
                style={{
                    display: 'block',
                    visibility: 'visible',
                    minHeight: '100px',
                }}
            />

            {/* Load script */}
            <Script
                src={scriptUrl}
                strategy="lazyOnload"
                async
                onLoad={() => {
                    if (typeof window !== 'undefined') {
                        console.log('[NativeBannerAd] Script loaded');
                    }
                }}
            />
        </div>
    );
};

export default NativeBannerAd;
