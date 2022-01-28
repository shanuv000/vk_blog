import React from "react";

import "../styles/globals.scss";
import { Layout } from "../components";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
        <title>{"key2success"}</title>
        <link rel="icon" href="/logo10.svg" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5634941748977646"
          crossorigin="anonymous"
        ></script>
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
