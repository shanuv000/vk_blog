import React, { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
import Footer from "./footer/Footer";

const Layout = ({ children }) => {
  const gid = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

  return (
    <>
      <DataProvider>
        <main className="scroll-smooth">
          {/* Use <main> */}
          <Header />
          {children}
          <div className="sm:container mx-auto px-4 lg:px-10 mb-4 lg:mb-8">
            <Footer />
          </div>
        </main>
        <GoogleAnalytics gaId={gid} /> {/* Move outside <main> */}
      </DataProvider>
    </>
  );
};

export default Layout;
