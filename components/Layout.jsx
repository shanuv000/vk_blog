import React, { memo, useEffect, useState } from "react";
import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
import Footer from "./footer/Footer";
import dynamic from "next/dynamic";

// Dynamically import the PWA components with no SSR
const PWAInstallPrompt = dynamic(() => import("./PWAInstallPrompt"), {
  ssr: false,
});

const PWAUpdatePrompt = dynamic(() => import("./PWAUpdatePrompt"), {
  ssr: false,
});

const ServiceWorkerCleanup = dynamic(() => import("./ServiceWorkerCleanup"), {
  ssr: false,
});

const MobileTroubleshootButton = dynamic(
  () => import("./MobileTroubleshootButton"),
  {
    ssr: false,
  }
);

// Memoize the Layout component to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  useEffect(() => {
    // Only show PWA prompt after a delay and in production
    if (process.env.NODE_ENV === "production") {
      const timer = setTimeout(() => {
        setShowPWAPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

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
          {showPWAPrompt && <PWAInstallPrompt />}
          <PWAUpdatePrompt />
          <ServiceWorkerCleanup />
          <MobileTroubleshootButton />
        </main>
      </DataProvider>
    </>
  );
});

export default Layout;
