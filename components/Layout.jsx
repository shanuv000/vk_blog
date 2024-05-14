import React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
const Layout = ({ children }) => {
  const gid = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
  return (
    <>
      <DataProvider>
        <Header />
        {children}
        <GoogleAnalytics gaId={gid} />
      </DataProvider>
    </>
  );
};

export default Layout;
