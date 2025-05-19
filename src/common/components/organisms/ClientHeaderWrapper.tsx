"use client";

import React from "react";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import ClientNavbarWrapper from "./ClientNavbarWrapper";
import ClientMobileHeaderWrapper from "./ClientMobileHeaderWrapper";

const ClientHeaderWrapper: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <ClientMobileHeaderWrapper /> : <ClientNavbarWrapper />;
};

export default ClientHeaderWrapper;
