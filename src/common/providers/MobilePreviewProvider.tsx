"use client";
import React, { createContext, useContext, useState } from "react";

interface MobilePreviewContextValue {
  mobilePreview: boolean;
  setMobilePreview: (value: boolean) => void;
}

const MobilePreviewContext = createContext<MobilePreviewContextValue | undefined>(
  undefined,
);

export const MobilePreviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobilePreview, setMobilePreview] = useState(false);

  return (
    <MobilePreviewContext.Provider value={{ mobilePreview, setMobilePreview }}>
      {children}
    </MobilePreviewContext.Provider>
  );
};

export const useMobilePreview = (): MobilePreviewContextValue => {
  const context = useContext(MobilePreviewContext);
  if (!context) {
    throw new Error("useMobilePreview must be used within a MobilePreviewProvider");
  }
  return context;
};

export default MobilePreviewProvider;
