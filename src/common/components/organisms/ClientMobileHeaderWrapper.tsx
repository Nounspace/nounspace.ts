"use client";

import React from "react";
import MobileHeader from "./MobileHeader";

export const ClientMobileHeaderWrapper: React.FC = React.memo(
  function ClientMobileHeaderWrapper() {
    return <MobileHeader />;
  }
);

export default ClientMobileHeaderWrapper;
