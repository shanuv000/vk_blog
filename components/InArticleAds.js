import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

/**
 * In-Article Native Banner Ad Component
 * 
 * This component injects ads between paragraphs in article content.
 * Uses direct script injection for maximum compatibility.
 * 
 * @param {Object} props
 * @param {React.RefObject} props.contentRef - Reference to the article content container
 * @param {number} [props.insertAfterParagraph=3] - Insert ad after this many paragraphs
 * @param {number} [props.maxAds=2] - Maximum number of in-article ads to show
 */
const InArticleAds = ({
    contentRef,
    insertAfterParagraph = 3,
    maxAds = 2,
}) => {
    const [adsReady, setAdsReady] = useState(false);
    const insertedRef = useRef(false);
    const adContainerRefs = useRef([]);

    // Adsterra Native Banner config
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        // Skip on server
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (insertedRef.current) return;

        // Function to insert ads
        const insertAds = () => {
            const contentContainer = contentRef?.current;
            if (!contentContainer) return false;

            // Find all paragraphs
            const paragraphs = contentContainer.querySelectorAll('p');
            if (paragraphs.length < insertAfterParagraph) return false;

            let adsPlaced = 0;
            const positions = [];

            // Calculate positions
            for (let i = insertAfterParagraph - 1; i < paragraphs.length && adsPlaced < maxAds; i += insertAfterParagraph + 2) {
                const p = paragraphs[i];
                if (!p || p.textContent.trim().length < 30) continue;
                if (p.nextElementSibling?.getAttribute('data-ad-slot')) continue;

                positions.push({ index: i, element: p });
                adsPlaced++;
            }

            if (positions.length === 0) return false;

            // Insert ad containers with unique IDs
            positions.forEach((pos, index) => {
                const uniqueId = `native-banner-${Date.now()}-${index}`;

                const adWrapper = document.createElement('div');
                adWrapper.setAttribute('data-ad-slot', index.toString());
                adWrapper.style.cssText = `
          margin: 24px 0 !important;
          padding: 16px 8px !important;
          border-top: 1px solid #e5e7eb !important;
          border-bottom: 1px solid #e5e7eb !important;
          text-align: center !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          min-height: 50px !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        `;

                adWrapper.innerHTML = `
          <div style="
            font-size: 10px !important;
            color: #9ca3af !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            margin-bottom: 12px !important;
            display: block !important;
          ">— Ad —</div>
          <div id="${uniqueId}" style="display: block !important;"></div>
        `;

                pos.element.parentNode.insertBefore(adWrapper, pos.element.nextSibling);
                adContainerRefs.current.push({ wrapper: adWrapper, containerId: uniqueId });
            });

            insertedRef.current = true;
            setAdsReady(true);
            return true;
        };

        // Try immediately, then with delays
        if (!insertAds()) {
            const timer1 = setTimeout(() => {
                if (!insertAds()) {
                    setTimeout(insertAds, 2000);
                }
            }, 1000);

            return () => clearTimeout(timer1);
        }

        // Cleanup
        return () => {
            adContainerRefs.current.forEach(({ wrapper }) => {
                if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper);
            });
            adContainerRefs.current = [];
            insertedRef.current = false;
        };
    }, [contentRef, insertAfterParagraph, maxAds]);

    // Load script after containers are ready
    if (!adsReady) return null;

    return (
        <Script
            src={scriptUrl}
            strategy="lazyOnload"
            async
            onLoad={() => {
                if (typeof window !== 'undefined') {
                    console.log('[InArticleAds] Script loaded');
                }
            }}
        />
    );
};

export default InArticleAds;
