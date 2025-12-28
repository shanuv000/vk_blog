import React, { useState, useEffect, useRef, useCallback } from "react";

const TwitterEmbed = ({ tweetId, useApiVersion = true }) => {
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const tweetContainerRef = useRef(null);

  // Clean and validate the tweet ID
  const cleanTweetId = tweetId ? tweetId.toString().trim() : "";
  const isValidTweetId =
    cleanTweetId && /^\d+$/.test(cleanTweetId) && cleanTweetId.length > 8;

  useEffect(() => {
    if (!isValidTweetId) {
      setError(true);
    }
  }, [isValidTweetId]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || isVisible) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  // Load Twitter widget script and render tweet
  useEffect(() => {
    if (!isVisible || !isValidTweetId || error) return;

    const loadTwitterWidget = () => {
      // Check if Twitter script is already loaded
      if (window.twttr?.widgets?.createTweet) {
        renderTweet();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
        // OPTIMIZED: Increased interval from 100ms to 500ms (80% fewer checks)
        const checkInterval = setInterval(() => {
          if (window.twttr?.widgets?.createTweet) {
            clearInterval(checkInterval);
            renderTweet();
          }
        }, 500);
        
        // OPTIMIZED: Reduced timeout from 10s to 5s
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.twttr?.widgets?.createTweet) {
            setError(true);
          }
        }, 5000);
        return;
      }

      // Load the script
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      
      script.onload = () => {
        if (window.twttr?.widgets?.createTweet) {
          renderTweet();
        } else {
          setError(true);
        }
      };
      
      script.onerror = () => {
        setError(true);
      };
      
      document.body.appendChild(script);
    };

    const renderTweet = async () => {
      if (!tweetContainerRef.current || !window.twttr?.widgets?.createTweet) {
        return;
      }

      try {
        // Clear any existing content
        tweetContainerRef.current.innerHTML = "";
        
        const element = await window.twttr.widgets.createTweet(
          cleanTweetId,
          tweetContainerRef.current,
          {
            theme: "light",
            align: "center",
            dnt: true,
            conversation: "none",
            cards: "visible",
          }
        );

        // If element is null/undefined, the tweet doesn't exist or is unavailable
        if (!element) {
          console.warn(`TwitterEmbed: Tweet ${cleanTweetId} not found or unavailable`);
          setError(true);
        } else {
          setRendered(true);
        }
      } catch (err) {
        console.error(`TwitterEmbed: Error rendering tweet ${cleanTweetId}`, err);
        setError(true);
      }
    };

    loadTwitterWidget();
  }, [isVisible, isValidTweetId, cleanTweetId, error]);

  // If invalid tweet ID or error, render nothing
  if (!isValidTweetId || error) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="twitter-embed-root my-4 w-full flex justify-center"
      style={{ 
        // Only show container when tweet is rendered
        visibility: rendered ? "visible" : "hidden",
        // Maintain minimal height during loading to prevent layout shift
        minHeight: rendered ? "auto" : 0,
        maxHeight: rendered ? "none" : 0,
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div
        ref={tweetContainerRef}
        className="twitter-tweet-container w-full max-w-[550px]"
      />
    </div>
  );
};

export default TwitterEmbed;
