"use client";
import React, { createContext, useContext, useState } from "react";

export interface GlobalFidgetStyleContextValue {
  borderRadius: number;
  spacing: number;
  setBorderRadius: (val: number) => void;
  setSpacing: (val: number) => void;
}

const GlobalFidgetStyleContext = createContext<GlobalFidgetStyleContextValue | undefined>(undefined);

export const GlobalFidgetStyleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [spacing, setSpacing] = useState<number>(16);

  return (
    <GlobalFidgetStyleContext.Provider
      value={{ borderRadius, spacing, setBorderRadius, setSpacing }}
    >
      {children}
    </GlobalFidgetStyleContext.Provider>
  );
};

export const useGlobalFidgetStyle = (): GlobalFidgetStyleContextValue => {
  const ctx = useContext(GlobalFidgetStyleContext);
  if (!ctx) {
    throw new Error("useGlobalFidgetStyle must be used within GlobalFidgetStyleProvider");
  }
  return ctx;
};

export default GlobalFidgetStyleProvider;
