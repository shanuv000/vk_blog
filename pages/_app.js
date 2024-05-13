import React, { useEffect } from "react";

import "../styles/globals.scss";
import { Layout } from "../components";
// import { useEffect } from "react";
// import Script from "next/script";
// import { useRouter } from "next/router";
// import * as gtag from "../lib/gtag";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import { GoogleAnalytics } from "@next/third-parties/google";
import { fetchData } from "../components/ExtractIPs/ipfunc";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  // const router = useRouter();
  useEffect(() => {
    async function fetchDataAsync() {
      await fetchData();
    }
    fetchDataAsync();
  }, []);
  const gid = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
  return (
    <>
      <Head>
        <title>Only Blog</title> {"blog"}
        <link
          rel="icon"
          href="https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/logo%2Fblog-logo%2Fmain-logo-transparent.png?alt=media&token=94294bb8-3404-44ce-81ab-b2f36ae1988e"
        />
        <meta
          name="keywords"
          content="tech, entertainment, sports, articles, news, updates, reviews, analysis, blog, blogging, diverse content, information, insights"
        />
      </Head>
      <Layout>
        <GoogleAnalytics gaId={gid} />
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
