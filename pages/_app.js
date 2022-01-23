import React from "react";

import "../styles/globals.scss";
import { Layout } from "../components";
import Document, { Html, Head, Main, NextScript } from "next/document";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
