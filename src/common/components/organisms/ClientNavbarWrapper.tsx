"use client";

import React from "react";
import AppNavbar from "./AppNavbar";
import Sidebar from "./Sidebar";

/**
 * Client-side wrapper for AppNavbar with Sidebar context
 * This enables the server component in layout.tsx to properly use client components
 */
export const ClientNavbarWrapper: React.FC = () => {
  return (
    <Sidebar.ContextProvider>
      <AppNavbar />
    </Sidebar.ContextProvider>
  );
};

export default ClientNavbarWrapper;
