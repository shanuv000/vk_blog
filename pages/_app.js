import React from "react";
import "../styles/globals.scss";
import { Layout } from "../components";
import Head from "next/head";
import Script from "next/script";
import ErrorBoundary from "../components/ErrorBoundary";

function MyApp({ Component, pageProps }) {
  return (
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

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ErrorBoundary>
  );
}

export default MyApp;
