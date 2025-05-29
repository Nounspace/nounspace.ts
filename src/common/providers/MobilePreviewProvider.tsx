"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export interface MobilePreviewContextValue {
  mobilePreview: boolean;
  setMobilePreview: (value: boolean) => void;
}

const MobilePreviewContext = createContext<MobilePreviewContextValue>({
  mobilePreview: false,
  setMobilePreview: () => {},
});

export const MobilePreviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobilePreview, setMobilePreview] = useState(false);

  const value = useMemo(
    () => ({ mobilePreview, setMobilePreview }),
    [mobilePreview],
  );

  return (
    <MobilePreviewContext.Provider value={value}>
      {children}
    </MobilePreviewContext.Provider>
  );
};

export const useMobilePreview = (): MobilePreviewContextValue => {
  return useContext(MobilePreviewContext);
};

export default MobilePreviewProvider;
