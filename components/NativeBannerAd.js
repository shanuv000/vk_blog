import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Content Promotion Section (Native Banner Ad)
 * 
 * Simple, reliable native banner that loads after article content.
 * Class names obfuscated to avoid adblocker CSS injection.
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
                Recommended
            </div>

            {/* Container */}
            <div
                id={containerId}
                className="promo-container"
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
            />
        </div>
    );
};

export default NativeBannerAd;
