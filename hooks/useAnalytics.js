import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  logFirebaseEvent,
  trackFirebaseContentView,
  trackFirebaseEngagement,
  trackFirebaseSearch,
  trackFirebaseException,
} from "../lib/firebase-analytics";

/**
 * Custom hook for analytics tracking (Google Analytics and Firebase)
 * @returns {Object} Analytics tracking functions
 */
export const useAnalytics = () => {
  const router = useRouter();

  // Track page views when route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    // Track initial page load
    if (window.gtag) {
      handleRouteChange(router.asPath);
    }

    // Track route changes
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  // Track custom events
  const trackEvent = useCallback((eventName, eventParams = {}) => {
    // Track in Google Analytics
    if (window.gtag) {
      window.gtag("event", eventName, eventParams);
    }

    // Track in Firebase Analytics
    logFirebaseEvent(eventName, eventParams);
  }, []);

  // Track user engagement
  const trackEngagement = useCallback(
    (action, category, label, value) => {
      // Track in Google Analytics
      trackEvent("engagement", {
        engagement_action: action,
        engagement_category: category,
        engagement_label: label,
        engagement_value: value,
      });

      // Track in Firebase Analytics
      trackFirebaseEngagement(action, {
        category,
        label,
        value,
      });
    },
    [trackEvent]
  );

  // Track content interaction
  const trackContentInteraction = useCallback(
    (contentType, contentId, action) => {
      // Track in Google Analytics
      trackEvent("content_interaction", {
        content_type: contentType,
        content_id: contentId,
        content_action: action,
      });

      // Track in Firebase Analytics
      if (action === "view") {
        trackFirebaseContentView(contentType, contentId, contentId);
      } else {
        logFirebaseEvent("content_interaction", {
          content_type: contentType,
          content_id: contentId,
          content_action: action,
        });
      }
    },
    [trackEvent]
  );

  // Track social interaction
  const trackSocialInteraction = useCallback(
    (network, action, target) => {
      // Track in Google Analytics
      trackEvent("social_interaction", {
        social_network: network,
        social_action: action,
        social_target: target,
      });

      // Track in Firebase Analytics
      logFirebaseEvent("social_interaction", {
        social_network: network,
        social_action: action,
        social_target: target,
      });
    },
    [trackEvent]
  );

  // Track search
  const trackSearch = useCallback(
    (searchTerm) => {
      // Track in Google Analytics
      trackEvent("search", {
        search_term: searchTerm,
      });

      // Track in Firebase Analytics
      trackFirebaseSearch(searchTerm);
    },
    [trackEvent]
  );

  // Track form submission
  const trackFormSubmission = useCallback(
    (formName, formId, success = true) => {
      // Track in Google Analytics
      trackEvent("form_submission", {
        form_name: formName,
        form_id: formId,
        form_success: success,
      });

      // Track in Firebase Analytics
      logFirebaseEvent("form_submission", {
        form_name: formName,
        form_id: formId,
        form_success: success,
      });
    },
    [trackEvent]
  );

  // Track error
  const trackError = useCallback(
    (errorType, errorMessage, errorSource) => {
      // Track in Google Analytics
      trackEvent("error", {
        error_type: errorType,
        error_message: errorMessage,
        error_source: errorSource,
      });

      // Track in Firebase Analytics
      trackFirebaseException(
        `${errorType}: ${errorMessage} (${errorSource})`,
        false
      );
    },
    [trackEvent]
  );

  // Track performance metrics
  const trackPerformance = useCallback(
    (metricName, metricValue, category = "Performance") => {
      // Track in Google Analytics
      trackEvent("performance", {
        metric_name: metricName,
        metric_value: metricValue,
        metric_category: category,
      });

      // Track in Firebase Analytics
      logFirebaseEvent("performance", {
        metric_name: metricName,
        metric_value: metricValue,
        metric_category: category,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackEngagement,
    trackContentInteraction,
    trackSocialInteraction,
    trackSearch,
    trackFormSubmission,
    trackError,
    trackPerformance,
  };
};

export default useAnalytics;
