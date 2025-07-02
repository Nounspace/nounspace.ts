import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export interface MobilePreviewContextValue {
  mobilePreview: boolean;
  setMobilePreview: (value: boolean) => void;
  toggleMobilePreview: () => void; 
}

const MobilePreviewContext = createContext<MobilePreviewContextValue>({
  mobilePreview: false,
  setMobilePreview: () => {},
  toggleMobilePreview: () => {},
});


export const MobilePreviewProvider = React.memo(function MobilePreviewProvider({
  children,
  initialValue = false, 
}: {
  children: React.ReactNode;
  initialValue?: boolean;
}) {
  const [mobilePreview, setMobilePreviewState] = useState(initialValue);

  const setMobilePreview = useCallback((value: boolean) => {
    setMobilePreviewState(value);
  }, []);
  
  const toggleMobilePreview = useCallback(() => {
    setMobilePreviewState(prev => !prev);
  }, []);

  const value = useMemo(
    () => ({ mobilePreview, setMobilePreview, toggleMobilePreview }),
    [mobilePreview, setMobilePreview, toggleMobilePreview],
  );

  return (
    <MobilePreviewContext.Provider value={value}>
      {children}
    </MobilePreviewContext.Provider>
  );
});

export const useMobilePreview = (): MobilePreviewContextValue => {
  const context = useContext(MobilePreviewContext);
  
  if (process.env.NODE_ENV !== 'production' && context === undefined) {
    throw new Error('useMobilePreview must be used within a MobilePreviewProvider');
  }
  
  return context;
};

export default MobilePreviewProvider;
