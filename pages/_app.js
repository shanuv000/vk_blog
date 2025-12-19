import React, { useEffect } from "react";

import "../styles/globals.scss";
import "../styles/medium-typography.css";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";

import { ApolloProvider } from "@apollo/client";
import { Analytics } from "@vercel/analytics/next";

import { Layout } from "../components";
import AnalyticsProvider from "../components/AnalyticsProvider";
import { DEFAULT_FEATURED_IMAGE } from "../components/DefaultAvatar";
import ErrorBoundary from "../components/ErrorBoundary";
import { initWebVitals } from "../components/WebVitals";
import { useApollo, getApolloStats } from "../lib/apollo-client";

// Add this to fix hydration issues

// Import prefetch function
import { prefetchCommonQueries } from "../services/hygraph";
// Import Web Vitals for performance monitoring

function MyApp({ Component, pageProps }) {
  // Initialize Apollo Client with the initial state
  const apolloClient = useApollo(pageProps.initialApolloState);
  // Use router to help with hydration issues
  const router = useRouter();

  // Preload critical resources and prefetch data
  useEffect(() => {
    // Load the carousel styles properly
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet"; // Changed from preload to stylesheet
    styleLink.href = "/react-multi-carousel/lib/styles.css";
    document.head.appendChild(styleLink);

    // Prefetch common queries during idle time (guarded to avoid over-fetching)
    if (typeof window !== "undefined") {
      // Wait for page to load before prefetching
      const prefetchData = () => {
        // Use requestIdleCallback or setTimeout to avoid blocking main thread
        const requestIdleCallback =
          window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

        requestIdleCallback(
          () => {
            // Dynamically import the carousel only when needed
            import("react-multi-carousel").catch((err) =>
              console.error("Error loading carousel:", err)
            );

            // Prefetch data after critical resources are loaded
            // Only prefetch on good network and when tab is visible
            // OPTIMIZATION: Skip prefetching on post pages - not needed there
            const isPostPage = window.location.pathname.startsWith('/post/');
            const connection =
              navigator.connection ||
              navigator.mozConnection ||
              navigator.webkitConnection;
            const isSlow =
              connection &&
              (connection.saveData ||
                ["slow-2g", "2g"].includes(connection.effectiveType));
            if (!document.hidden && !isSlow && !isPostPage) {
              prefetchCommonQueries();
            }

            // Log cache stats after prefetching (development only)
            if (process.env.NODE_ENV === "development") {
              setTimeout(() => {
                console.log("Apollo cache stats:", getApolloStats());
              }, 2000);
            }
          },
          { timeout: 2000 }
        );
      };

      if (document.readyState === "complete") {
        prefetchData();
      } else {
        window.addEventListener("load", prefetchData);
      }
    }

    // Initialize Web Vitals monitoring
    initWebVitals();

    return () => {
      if (styleLink.parentNode) {
        document.head.removeChild(styleLink);
      }
    };
  }, []);

  // Get Google Analytics ID from environment variables
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "G-VQRT44X8WH";

  // Add a key based on the route to force remounting of components when route changes
  // This helps avoid hydration issues by ensuring a fresh render on route changes
  const pageKey = router.asPath;

  return (
    <ApolloProvider client={apolloClient}>
      <ErrorBoundary>
        <Head>
          <title>urTechy Blogs</title>
          <meta
            name="keywords"
            content="tech, entertainment, sports, articles, news, updates, reviews, analysis, blog, blogging, diverse content, information, insights"
          />
          <meta
            name="description"
            content="Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Optimized font loading - preload critical fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          {/* Preload critical font weights for faster LCP */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
            as="style"
            onLoad="this.onload=null;this.rel='stylesheet'"
          />
          <noscript>
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
              rel="stylesheet"
            />
          </noscript>

          {/* Default images - using prefetch instead of preload */}
          <link rel="prefetch" href={DEFAULT_FEATURED_IMAGE} />

          {/* Preconnect to image domains */}
          <link
            rel="preconnect"
            href="https://ap-south-1.cdn.hygraph.com"
            crossOrigin="anonymous"
          />
          <link
            rel="preconnect"
            href="https://media.graphassets.com"
            crossOrigin="anonymous"
          />
          <link
            rel="preconnect"
            href="https://ap-south-1.graphassets.com"
            crossOrigin="anonymous"
          />

          {/* Resource hints for faster loading */}
          <link rel="dns-prefetch" href="https://ap-south-1.cdn.hygraph.com" />
          <link rel="dns-prefetch" href="https://media.graphassets.com" />
          <link rel="dns-prefetch" href="https://ap-south-1.graphassets.com" />

          {/* Preconnect to Google Analytics */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
        </Head>

        <AnalyticsProvider measurementId={gaId}>
          <Layout>
            {/* Use key to force remount on route change */}
            <div key={pageKey}>
              <Component {...pageProps} />
            </div>
          </Layout>
          <Analytics />
        </AnalyticsProvider>
      </ErrorBoundary>
    </ApolloProvider>
  );
}

export default MyApp;
