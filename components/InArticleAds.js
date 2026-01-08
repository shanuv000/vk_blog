import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

/**
 * In-Article Content Separator Component (Native Banner Ad)
 * 
 * Injects content separators between paragraphs.
 * Class names are obfuscated to avoid adblocker CSS injection.
 */
const InArticleAds = ({
    contentRef,
    insertAfterParagraph = 3,
    maxAds = 2,
}) => {
    const [adsReady, setAdsReady] = useState(false);
    const insertedRef = useRef(false);
    const containerRefs = useRef([]);

    // Adsterra Native Banner config
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (insertedRef.current) return;

        const insertAds = () => {
            const contentContainer = contentRef?.current;
            if (!contentContainer) return false;

            const paragraphs = contentContainer.querySelectorAll('p');
            if (paragraphs.length < insertAfterParagraph) return false;

            let adsPlaced = 0;
            const positions = [];

            for (let i = insertAfterParagraph - 1; i < paragraphs.length && adsPlaced < maxAds; i += insertAfterParagraph + 2) {
                const p = paragraphs[i];
                if (!p || p.textContent.trim().length < 30) continue;
                if (p.nextElementSibling?.getAttribute('data-content-break')) continue;

                positions.push({ index: i, element: p });
                adsPlaced++;
            }

            if (positions.length === 0) return false;

            positions.forEach((pos, index) => {
                const uniqueId = `cb-${Date.now()}-${index}`;

                // Use generic class names to avoid adblocker detection
                const wrapper = document.createElement('div');
                wrapper.setAttribute('data-content-break', index.toString());
                wrapper.className = 'content-break-section';
                wrapper.style.cssText = `
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

                wrapper.innerHTML = `
          <div style="
            font-size: 10px !important;
            color: #9ca3af !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            margin-bottom: 12px !important;
            display: block !important;
          ">—</div>
          <div id="${uniqueId}" class="promo-container" style="display: block !important;"></div>
        `;

                pos.element.parentNode.insertBefore(wrapper, pos.element.nextSibling);
                containerRefs.current.push({ wrapper, containerId: uniqueId });
            });

            insertedRef.current = true;
            setAdsReady(true);
            return true;
        };

        if (!insertAds()) {
            const timer1 = setTimeout(() => {
                if (!insertAds()) {
                    setTimeout(insertAds, 2000);
                }
            }, 1000);

            return () => clearTimeout(timer1);
        }

        return () => {
            containerRefs.current.forEach(({ wrapper }) => {
                if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper);
            });
            containerRefs.current = [];
            insertedRef.current = false;
        };
    }, [contentRef, insertAfterParagraph, maxAds]);

    if (!adsReady) return null;

    return (
        <Script
            src={scriptUrl}
            strategy="lazyOnload"
            async
        />
    );
};

export default InArticleAds;
