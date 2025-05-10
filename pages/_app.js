import React, { useEffect } from "react";
import "../styles/globals.scss";
import "../styles/medium-typography.css";
import { Layout } from "../components";
import Head from "next/head";
import Script from "next/script";
import ErrorBoundary from "../components/ErrorBoundary";
import { DEFAULT_FEATURED_IMAGE } from "../components/DefaultAvatar";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apollo-client";
import AnalyticsProvider from "../components/AnalyticsProvider";
// Add this to fix hydration issues
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  // Initialize Apollo Client with the initial state
  const apolloClient = useApollo(pageProps.initialApolloState);
  // Use router to help with hydration issues
  const router = useRouter();

  // Preload critical resources
  useEffect(() => {
    // Dynamically import the carousel to ensure it's available
    import("react-multi-carousel").catch((err) =>
      console.error("Error preloading carousel:", err)
    );

    // Load the carousel styles properly
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet"; // Changed from preload to stylesheet
    styleLink.href = "/react-multi-carousel/lib/styles.css";
    document.head.appendChild(styleLink);

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

          {/* Fonts for Medium-like typography */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
            rel="stylesheet"
          />

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

        {/* Microsoft Clarity - load after page interaction */}
        <Script
          id="clarity-script"
          strategy="afterInteraction" // Changed from lazyOnload to afterInteraction
          src="https://www.clarity.ms/tag/o2yidwokf0"
        />

        <AnalyticsProvider measurementId={gaId}>
          <Layout>
            {/* Use key to force remount on route change */}
            <div key={pageKey}>
              <Component {...pageProps} />
            </div>
          </Layout>
        </AnalyticsProvider>
      </ErrorBoundary>
    </ApolloProvider>
  );
}

export default MyApp;
