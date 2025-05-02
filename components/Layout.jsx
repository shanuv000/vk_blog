import React, { memo } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
import Footer from "./footer/Footer";

// Memoize the Layout component to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  const gid = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

  return (
    <>
      <DataProvider>
        <main className="scroll-smooth">
          <Header />
          <div className="pt-24 sm:pt-28">
            {children}
            <div className="sm:container mx-auto px-4 lg:px-10 mb-4 lg:mb-8">
              <Footer />
            </div>
          </div>
        </main>
        <GoogleAnalytics gaId={gid} />
      </DataProvider>
    </>
  );
});

export default Layout;
