import { useState, useEffect } from "react";

export const useHasWindow = (): boolean => {
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window != "undefined") {
      setHasWindow(true);
    }
  }, []);

  return hasWindow;
};

export default useHasWindow;
