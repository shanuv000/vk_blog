import React, { useEffect } from "react";
import "../styles/globals.scss";
import { Layout } from "../components";
import Head from "next/head";
import Script from "next/script";
import ErrorBoundary from "../components/ErrorBoundary";
import { DEFAULT_FEATURED_IMAGE } from "../components/DefaultAvatar";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apollo-client";
import AnalyticsProvider from "../components/AnalyticsProvider";

function MyApp({ Component, pageProps }) {
  // Initialize Apollo Client with the initial state
  const apolloClient = useApollo(pageProps.initialApolloState);

  // Preload critical resources
  useEffect(() => {
    // Preload the carousel script
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "script";
    preloadLink.href =
      "/_next/static/chunks/node_modules_react-multi-carousel_lib_index.js";
    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  // Get Google Analytics ID from environment variables
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "G-VQRT44X8WH";

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

          {/* Preload default images */}
          <link rel="preload" as="image" href={DEFAULT_FEATURED_IMAGE} />

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

          {/* Resource hints for faster loading */}
          <link rel="dns-prefetch" href="https://ap-south-1.cdn.hygraph.com" />
          <link rel="dns-prefetch" href="https://media.graphassets.com" />

          {/* Preconnect to Google Analytics */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
        </Head>

        {/* Microsoft Clarity - load after page interaction */}
        <Script
          id="clarity-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "o2yidwokf0");
            `,
          }}
        />

        <AnalyticsProvider measurementId={gaId}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AnalyticsProvider>
      </ErrorBoundary>
    </ApolloProvider>
  );
}

export default MyApp;
