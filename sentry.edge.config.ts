// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://01bc457e6fd07ca0356b8d62e3a8f148@o4510203549384704.ingest.us.sentry.io/4510205861363712",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // Using environment variable to control sample rate (default to 0.1 for production to stay within free tier)
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1"),

  // Set environment
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",

  // Enable logs to be sent to Sentry (only in production)
  enableLogs: process.env.NODE_ENV === "production",

  // Disable sending PII for privacy (Free tier best practice)
  sendDefaultPii: false,

  // Ignore common errors that don't need tracking
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "atomicFindClose",
    // Random network errors
    "NetworkError",
    "Network request failed",
    // 404 errors
    "404",
    "Not Found",
  ],
});
