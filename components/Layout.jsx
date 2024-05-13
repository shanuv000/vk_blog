import React from "react";
import { Header } from "./";
import { DataProvider } from "../store/HandleApiContext";
const Layout = ({ children }) => {
  return (
    <>
      <DataProvider>
        <Header />
        {children}
      </DataProvider>
    </>
  );
};

export default Layout;
