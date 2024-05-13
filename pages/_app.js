import React from "react";

import "../styles/globals.scss";
import { Layout } from "../components";
// import { useEffect } from "react";
// import Script from "next/script";
// import { useRouter } from "next/router";
// import * as gtag from "../lib/gtag";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import { GoogleAnalytics } from "@next/third-parties/google";

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  // const router = useRouter();

  return (
    <>
      <Head>
        <title>Only Blog</title> {"blog"}
        <link
          rel="icon"
          href="https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/logo%2Fblog-logo%2Fmain-logo-transparent.png?alt=media&token=94294bb8-3404-44ce-81ab-b2f36ae1988e"
        />
        {/* SEO Meta Tags */}
        {/* <meta
          name="description"
          content="Explore a world of diverse content on [Your Blogging Website Name]. From the latest in tech innovations to captivating entertainment news and thrilling sports updates, our platform offers a plethora of engaging articles and insights. Delve into a universe of information and entertainment, all in one place."
        /> */}
        <meta
          name="keywords"
          content="tech, entertainment, sports, articles, news, updates, reviews, analysis, blog, blogging, diverse content, information, insights"
        />
        {/* <meta property="og:title" content="key2success" /> */}
        {/* <meta
          property="og:description"
          content="Discover a treasure trove of content on [Your Blogging Website Name]. From the latest in tech to captivating entertainment and thrilling sports updates, explore a world of diverse articles and insights, all in one place."
        /> */}
        {/* <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/Portfolio%20work%2Fs.png?alt=media&token=ea44c393-6f7d-470c-9750-a707100affb1"
        /> */}
        {/* <meta property="og:url" content="https://onlyblog.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="key2success" /> */}
      </Head>
      <Layout>
        <Component {...pageProps} /> <GoogleAnalytics gaId="G-LW10VJQH6L" />
      </Layout>
    </>
  );
}

export default MyApp;
