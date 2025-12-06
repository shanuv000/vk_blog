import React, { memo } from "react";
import LazyDataProvider from "../store/LazyDataProvider";
import Footer from "./footer/Footer";
import { Header } from "./";

// Removed PWA components for better performance
// Removed MobileTroubleshootButton as it was PWA-related

// Memoize the Layout component to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  return (
    <LazyDataProvider>
      {/* Skip to content link for keyboard accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <main className="scroll-smooth bg-secondary-dark text-text-primary min-h-screen">
        <Header />
        <div className="pt-24 sm:pt-28">
          <div id="main-content" className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
            {children}
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 lg:mb-8">
            <Footer />
          </div>
        </div>
      </main>
    </LazyDataProvider>
  );
});

// Add display name for debugging
Layout.displayName = 'Layout';

export default Layout;

