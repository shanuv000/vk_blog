import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Native Banner Ad Component - Optimized for Fast Loading
 * 
 * Uses 'afterInteractive' strategy for faster script loading.
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
            className={`content-promo-wrapper ${className}`}
            style={{
                margin: '24px 0',
                padding: '16px 0',
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
                    fontSize: '10px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px',
                }}
            >
                Recommended
            </div>

            {/* Container */}
            <div
                id={containerId}
                style={{
                    display: 'block',
                    visibility: 'visible',
                    minHeight: '90px',
                }}
            />

            {/* Load script - 'afterInteractive' loads right after page becomes interactive */}
            <Script
                src={scriptUrl}
                strategy="afterInteractive"
            />
        </div>
    );
};

export default NativeBannerAd;
