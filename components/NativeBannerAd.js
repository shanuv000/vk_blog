import { useEffect, useState } from 'react';

/**
 * Native Banner Ad Component - Performance Optimized
 * 
 * Loads ad script after a short delay to not block initial rendering.
 * Uses vanilla JS for maximum performance.
 */
const NativeBannerAd = ({ className = '' }) => {
    const [mounted, setMounted] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const containerId = 'container-1f24392931355411bbd46ad36048cd1a';
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        setMounted(true);

        // Load ad script after a short delay to not block main thread
        const timer = setTimeout(() => {
            if (document.getElementById('adsterra-native-script')) {
                setScriptLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'adsterra-native-script';
            script.src = scriptUrl;
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            document.body.appendChild(script);
        }, 100); // Small delay to let critical content render first

        return () => clearTimeout(timer);
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
        </div>
    );
};

export default NativeBannerAd;
