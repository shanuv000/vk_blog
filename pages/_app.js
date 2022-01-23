import React from "react";

import "../styles/globals.scss";
import { Layout } from "../components";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
        <title>{"VK BLOG"}</title>
        <link rel="icon" href="/dear.png" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
