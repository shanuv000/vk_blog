import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

/**
 * In-Article Native Banner Ad Component
 * 
 * Injects ONE Adsterra Native Banner ad between paragraphs.
 * Note: Adsterra only supports one native banner container per page.
 */
const InArticleAds = ({
    contentRef,
    insertAfterParagraph = 4,
}) => {
    const [adReady, setAdReady] = useState(false);
    const insertedRef = useRef(false);
    const wrapperRef = useRef(null);

    // Adsterra Native Banner config - EXACT container ID required
    const containerId = 'container-1f24392931355411bbd46ad36048cd1a';
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (insertedRef.current) return;

        const insertAd = () => {
            const contentContainer = contentRef?.current;
            if (!contentContainer) return false;

            const paragraphs = contentContainer.querySelectorAll('p');
            if (paragraphs.length < insertAfterParagraph) return false;

            // Find a suitable paragraph to insert after
            let targetParagraph = null;
            for (let i = insertAfterParagraph - 1; i < paragraphs.length; i++) {
                const p = paragraphs[i];
                if (p && p.textContent.trim().length > 50) {
                    targetParagraph = p;
                    break;
                }
            }

            if (!targetParagraph) return false;

            // Create the ad wrapper with the EXACT container ID Adsterra expects
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
        margin: 32px 0 !important;
        padding: 20px 12px !important;
        border-top: 1px solid #e5e7eb !important;
        border-bottom: 1px solid #e5e7eb !important;
        text-align: center !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        min-height: 120px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        background: linear-gradient(to bottom, rgba(249,250,251,0.5), transparent, rgba(249,250,251,0.5)) !important;
      `;

            wrapper.innerHTML = `
        <div style="
          font-size: 10px !important;
          color: #9ca3af !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          margin-bottom: 12px !important;
          display: block !important;
        ">Recommended</div>
        <div id="${containerId}" style="display: block !important; min-height: 90px;"></div>
      `;

            targetParagraph.parentNode.insertBefore(wrapper, targetParagraph.nextSibling);
            wrapperRef.current = wrapper;
            insertedRef.current = true;
            setAdReady(true);

            return true;
        };

        // Try to insert with delays for content to render
        if (!insertAd()) {
            const timer1 = setTimeout(() => {
                if (!insertAd()) {
                    setTimeout(insertAd, 2000);
                }
            }, 1000);

            return () => clearTimeout(timer1);
        }

        return () => {
            if (wrapperRef.current?.parentNode) {
                wrapperRef.current.parentNode.removeChild(wrapperRef.current);
            }
            wrapperRef.current = null;
            insertedRef.current = false;
        };
    }, [contentRef, insertAfterParagraph]);

    // Don't load script until container is ready
    if (!adReady) return null;

    return (
        <Script
            src={scriptUrl}
            strategy="lazyOnload"
            async
        />
    );
};

export default InArticleAds;
