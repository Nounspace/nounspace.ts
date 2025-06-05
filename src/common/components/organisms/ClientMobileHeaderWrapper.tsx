"use client";

import React from "react";
import MobileHeader from "./MobileHeader";
import Sidebar from "./Sidebar";

export const ClientMobileHeaderWrapper: React.FC = () => {
  return (
    <Sidebar.ContextProvider>
      <MobileHeader />
    </Sidebar.ContextProvider>
  );
};

export default ClientMobileHeaderWrapper;
