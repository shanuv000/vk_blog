import { useEffect, useRef, useState } from 'react';

/**
 * In-Article Ads Component (Placeholder)
 * 
 * NOTE: Adsterra's Native Banner ad code only supports ONE container per page.
 * The container ID must exactly match what their script expects.
 * 
 * Since NativeBannerAd already uses the native banner ad code at the end
 * of articles, this component cannot use the same ad code for in-article ads.
 * 
 * To have in-article ads, you would need:
 * 1. A different ad format from Adsterra (e.g., Banner 300x250, In-Page Push)
 * 2. Or a separate ad unit/script for in-article placement
 * 
 * For now, this component creates subtle content separators without ads.
 */
const InArticleAds = ({
    contentRef,
    insertAfterParagraph = 3,
    maxAds = 2,
}) => {
    const insertedRef = useRef(false);
    const containerRefs = useRef([]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (insertedRef.current) return;

        const insertSeparators = () => {
            const contentContainer = contentRef?.current;
            if (!contentContainer) return false;

            const paragraphs = contentContainer.querySelectorAll('p');
            if (paragraphs.length < insertAfterParagraph) return false;

            let separatorsPlaced = 0;
            const positions = [];

            for (let i = insertAfterParagraph - 1; i < paragraphs.length && separatorsPlaced < maxAds; i += insertAfterParagraph + 3) {
                const p = paragraphs[i];
                if (!p || p.textContent.trim().length < 30) continue;
                if (p.nextElementSibling?.getAttribute('data-separator')) continue;

                positions.push({ index: i, element: p });
                separatorsPlaced++;
            }

            if (positions.length === 0) return false;

            // Insert subtle separators (placeholders for future ad integration)
            positions.forEach((pos, index) => {
                const wrapper = document.createElement('div');
                wrapper.setAttribute('data-separator', index.toString());
                wrapper.style.cssText = `
          margin: 32px 0 !important;
          padding: 0 !important;
          text-align: center !important;
          display: block !important;
        `;

                // Just a subtle visual break for now
                wrapper.innerHTML = `
          <div style="
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 0 auto;
          "></div>
        `;

                pos.element.parentNode.insertBefore(wrapper, pos.element.nextSibling);
                containerRefs.current.push(wrapper);
            });

            insertedRef.current = true;
            return true;
        };

        if (!insertSeparators()) {
            const timer1 = setTimeout(() => {
                if (!insertSeparators()) {
                    setTimeout(insertSeparators, 2000);
                }
            }, 1000);

            return () => clearTimeout(timer1);
        }

        return () => {
            containerRefs.current.forEach((wrapper) => {
                if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper);
            });
            containerRefs.current = [];
            insertedRef.current = false;
        };
    }, [contentRef, insertAfterParagraph, maxAds]);

    // This component doesn't render any visible React elements
    // It only adds subtle separators to the DOM
    return null;
};

export default InArticleAds;
