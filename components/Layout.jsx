import React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";

const Layout = ({ children }) => {
  const gid = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
  return (
    <>
      <DataProvider>
        <main className="scroll-smooth">
          {/* Use <main> */}
          <Header />
          {children}
        </main>
        <GoogleAnalytics gaId={gid} /> {/* Move outside <main> */}
      </DataProvider>
    </>
  );
};

export default Layout;
