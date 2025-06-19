"use client";

import React from "react";
import MobileHeader from "./MobileHeader";
import { SidebarContextProvider } from "./Sidebar";

export const ClientMobileHeaderWrapper: React.FC = React.memo(
  function ClientMobileHeaderWrapper() {
    return (
      <SidebarContextProvider>
        <MobileHeader />
      </SidebarContextProvider>
    );
  }
);

export default ClientMobileHeaderWrapper;
