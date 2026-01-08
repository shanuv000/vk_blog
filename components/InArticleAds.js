import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

/**
 * In-Article Native Banner Ad Component
 * 
 * This component injects ads between paragraphs in article content.
 * It uses DOM observation to insert ads after the content is rendered.
 * 
 * Features:
 * - Inserts ads after every N paragraphs
 * - Lazy loads ads as they come into view
 * - Doesn't disrupt the reading flow
 * - Mobile-aware with proper spacing
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
    const [adsInserted, setAdsInserted] = useState(false);
    const observerRef = useRef(null);
    const adContainerRefs = useRef([]);
    const mutationObserverRef = useRef(null);

    // Adsterra Native Banner config
    const containerId = 'container-1f24392931355411bbd46ad36048cd1a';
    const scriptUrl = 'https://pl28428839.effectivegatecpm.com/1f24392931355411bbd46ad36048cd1a/invoke.js';

    const insertAds = () => {
        const contentContainer = contentRef?.current;
        if (!contentContainer || adsInserted) return false;

        // Find all paragraphs in the article content (direct children or nested)
        const paragraphs = contentContainer.querySelectorAll('p');

        if (paragraphs.length < insertAfterParagraph) {
            console.log(`[InArticleAds] Not enough paragraphs (${paragraphs.length}), need at least ${insertAfterParagraph}`);
            return false;
        }

        console.log(`[InArticleAds] Found ${paragraphs.length} paragraphs, inserting ads...`);

        // Calculate positions to insert ads
        let adsPlaced = 0;
        const adPositions = [];

        // Start after first N paragraphs, then every N+1 paragraphs
        for (let i = insertAfterParagraph - 1; i < paragraphs.length && adsPlaced < maxAds; i += insertAfterParagraph + 2) {
            const paragraph = paragraphs[i];

            // Skip if this paragraph is too short (likely a caption or empty line)
            if (!paragraph || paragraph.textContent.trim().length < 30) continue;

            // Skip if already has an ad nearby
            if (paragraph.nextElementSibling?.classList?.contains('in-article-ad-wrapper')) continue;

            adPositions.push({ index: i, element: paragraph });
            adsPlaced++;
        }

        if (adPositions.length === 0) {
            console.log('[InArticleAds] No valid positions found for ads');
            return false;
        }

        console.log(`[InArticleAds] Inserting ${adPositions.length} ads at positions:`, adPositions.map(p => p.index));

        // Insert ad containers
        adPositions.forEach((position, index) => {
            const paragraph = position.element;
            if (!paragraph || !paragraph.parentNode) return;

            // Create ad wrapper
            const adWrapper = document.createElement('div');
            adWrapper.className = 'in-article-ad-wrapper';
            adWrapper.id = `in-article-ad-${index}`;
            adWrapper.setAttribute('data-ad-slot', index.toString());
            adWrapper.innerHTML = `
        <div class="in-article-ad-container" style="
          margin: 2rem 0;
          padding: 1.5rem 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
          background: linear-gradient(to bottom, rgba(249,250,251,0.5), transparent, rgba(249,250,251,0.5));
        ">
          <div style="
            font-size: 0.65rem;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.75rem;
            font-weight: 500;
          ">Advertisement</div>
          <div id="${containerId}-inline-${index}" class="adsterra-inline-container"></div>
        </div>
      `;

            // Insert after the paragraph
            paragraph.parentNode.insertBefore(adWrapper, paragraph.nextSibling);

            // Store reference for cleanup
            adContainerRefs.current.push(adWrapper);
        });

        setAdsInserted(true);
        console.log('[InArticleAds] ✓ Ads inserted successfully');

        // Use Intersection Observer to lazy load ads
        if (adPositions.length > 0 && typeof IntersectionObserver !== 'undefined') {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const adContainer = entry.target;

                            // Only load if not already loaded
                            if (!adContainer.dataset.loaded) {
                                console.log(`[InArticleAds] Loading ad for ${adContainer.id}`);
                                adContainer.dataset.loaded = 'true';

                                // Load the Adsterra script if not already present
                                if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
                                    const script = document.createElement('script');
                                    script.src = scriptUrl;
                                    script.async = true;
                                    script.setAttribute('data-cfasync', 'false');
                                    script.onerror = () => console.error('[InArticleAds] Failed to load ad script');
                                    document.body.appendChild(script);
                                }
                            }
                        }
                    });
                },
                { rootMargin: '300px', threshold: 0 }
            );

            // Observe all ad wrappers
            adContainerRefs.current.forEach((wrapper) => {
                if (wrapper) observerRef.current.observe(wrapper);
            });
        }

        return true;
    };

    useEffect(() => {
        // Skip on server
        if (typeof window === 'undefined') return;

        // Try to insert ads after a delay (content may not be rendered yet)
        const initialTimer = setTimeout(() => {
            if (!insertAds()) {
                console.log('[InArticleAds] Initial attempt failed, setting up MutationObserver...');

                // Use MutationObserver to watch for content changes
                if (contentRef?.current && typeof MutationObserver !== 'undefined') {
                    mutationObserverRef.current = new MutationObserver((mutations) => {
                        // Check if paragraphs were added
                        const hasNewParagraphs = mutations.some(m =>
                            Array.from(m.addedNodes).some(n =>
                                n.nodeName === 'P' || (n.querySelectorAll && n.querySelectorAll('p').length > 0)
                            )
                        );

                        if (hasNewParagraphs && insertAds()) {
                            // Success - disconnect observer
                            mutationObserverRef.current?.disconnect();
                        }
                    });

                    mutationObserverRef.current.observe(contentRef.current, {
                        childList: true,
                        subtree: true
                    });
                }
            }
        }, 1000); // Wait 1 second for initial content render

        // Cleanup
        return () => {
            clearTimeout(initialTimer);

            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            if (mutationObserverRef.current) {
                mutationObserverRef.current.disconnect();
            }

            // Remove injected ad containers on cleanup
            adContainerRefs.current.forEach((wrapper) => {
                if (wrapper && wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            });
            adContainerRefs.current = [];
        };
    }, [contentRef, insertAfterParagraph, maxAds]);

    // This component doesn't render anything visible
    // It only injects ads into the DOM
    return null;
};

export default InArticleAds;
