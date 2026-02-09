"use client";

import React, { createContext, useContext } from "react";
import type { SystemConfig } from "@/config";

const SystemConfigContext = createContext<SystemConfig | null>(null);

type SystemConfigProviderProps = {
  children: React.ReactNode;
  systemConfig: SystemConfig;
};

export function SystemConfigProvider({
  children,
  systemConfig,
}: SystemConfigProviderProps) {
  return (
    <SystemConfigContext.Provider value={systemConfig}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfigContext(): SystemConfig | null {
  return useContext(SystemConfigContext);
}
