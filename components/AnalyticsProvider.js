import React, { useEffect } from "react";
import { useRouter } from "next/router";
import * as analytics from "../lib/analytics";
import {
  initFirebaseAnalytics,
  trackFirebasePageView,
  trackFirebaseEngagement,
} from "../lib/firebase-analytics";

/**
 * AnalyticsProvider component to initialize and manage analytics
 * @param {Object} props - Component props
 * @param {string} props.measurementId - Google Analytics measurement ID
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} - The wrapped children components
 */
const AnalyticsProvider = ({ measurementId, children }) => {
  const router = useRouter();

  useEffect(() => {
    // Skip analytics in development unless explicitly enabled
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV
    ) {
      console.log(
        "Analytics disabled in development. Set NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV to enable."
      );
      return;
    }

    // Initialize Google Analytics
    if (measurementId) {
      analytics.initGA(measurementId);
    }

    // Initialize Firebase Analytics
    initFirebaseAnalytics();

    // Track initial page view
    analytics.pageview(router.asPath, document.title);
    trackFirebasePageView(router.asPath, document.title);

    // Track route changes
    const handleRouteChange = (url) => {
      analytics.pageview(url, document.title);
      trackFirebasePageView(url, document.title);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Set up scroll depth tracking
    const removeScrollTracking = analytics.trackScrollDepth();

    // Set up time on page tracking
    const removeTimeTracking = analytics.trackTimeOnPage();

    // Set up outbound link tracking
    const removeOutboundLinkTracking = analytics.trackOutboundLinks();

    // Set up file download tracking
    const removeFileDownloadTracking = analytics.trackFileDownloads();

    // Track session start
    trackFirebaseEngagement("session_start");

    // Clean up event listeners on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      removeScrollTracking();
      removeTimeTracking();
      removeOutboundLinkTracking();
      removeFileDownloadTracking();

      // Track session end
      trackFirebaseEngagement("session_end");
    };
  }, [measurementId, router]);

  return <>{children}</>;
};

export default AnalyticsProvider;
