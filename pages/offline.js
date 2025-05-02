import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Offline() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(checkMobile);
  }, []);

  const handleReset = () => {
    // Set flag to trigger service worker cleanup on next load
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa_needs_cleanup", "true");
      // Reload the page to start the cleanup process
      window.location.reload();
    }
  };

  return (
    <>
      <Head>
        <title>Offline - urTechy Blogs</title>
        <meta
          name="description"
          content="You are currently offline. Please check your internet connection."
        />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-urtechy-red">
            You're Offline
          </h1>
          <p className="mb-6 text-gray-700">
            It seems you're not connected to the internet. Please check your
            connection and try again.
          </p>
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto text-urtechy-orange"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.07m-3.535 3.536a1 1 0 010-1.414m-2.121 2.121a3 3 0 010-4.243"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3l18 18"
              />
            </svg>
          </div>

          <div className="flex flex-col space-y-4">
            <Link href="/">
              <span className="transition duration-500 ease transform hover:-translate-y-1 inline-block bg-urtechy-red text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer">
                Try Again
              </span>
            </Link>

            {isMobile && (
              <div className="mt-6 border-t pt-6 border-gray-200">
                <h2 className="text-lg font-semibold mb-2">
                  Still having issues?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  If you're still experiencing problems, try these steps:
                </p>
                <ul className="text-sm text-left text-gray-600 mb-4 space-y-2">
                  <li>• Check that your device is connected to the internet</li>
                  <li>• Try switching between Wi-Fi and mobile data</li>
                  <li>
                    • Close other apps that might be using network resources
                  </li>
                  <li>• Try the reset button below to clear cached data</li>
                </ul>
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
                >
                  Reset App Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
