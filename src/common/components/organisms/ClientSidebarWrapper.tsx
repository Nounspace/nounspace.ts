"use client";

import React from "react";
import Sidebar from "./Sidebar";

/**
 * Client-side wrapper for Sidebar
 * This enables the server component in layout.tsx to properly use client components
 */
export const ClientSidebarWrapper: React.FC = () => {
  return <Sidebar />;
};

export default ClientSidebarWrapper;
