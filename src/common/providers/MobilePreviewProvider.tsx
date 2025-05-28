"use client";
import React, { createContext, useContext, useState } from "react";

export interface MobilePreviewContextValue {
  forceMobile: boolean;
  setForceMobile: (value: boolean) => void;
}

const MobilePreviewContext = createContext<MobilePreviewContextValue>({
  forceMobile: false,
  setForceMobile: () => {},
});

export const MobilePreviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [forceMobile, setForceMobile] = useState(false);

  return (
    <MobilePreviewContext.Provider value={{ forceMobile, setForceMobile }}>
      {children}
    </MobilePreviewContext.Provider>
  );
};

export const useMobilePreview = (): MobilePreviewContextValue =>
  useContext(MobilePreviewContext);

export default MobilePreviewProvider;
