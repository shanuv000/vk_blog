import React, { memo, useEffect, useState } from "react";
import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
import Footer from "./footer/Footer";
import dynamic from "next/dynamic";

// Removed PWA components for better performance

// Removed MobileTroubleshootButton as it was PWA-related

// Memoize the Layout component to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  return (
    <>
      <DataProvider>
        <main className="scroll-smooth bg-secondary-dark text-text-primary min-h-screen">
          <Header />
          <div className="pt-24 sm:pt-28">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
              {children}
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 lg:mb-8">
              <Footer />
            </div>
          </div>
        </main>
      </DataProvider>
    </>
  );
});

export default Layout;
