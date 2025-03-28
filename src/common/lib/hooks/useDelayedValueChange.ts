import { useEffect, useState } from "react";

export const useDelayedValueChange = (
  value: any,
  delayMs = 10000,
  shouldDelay: (prevValue, currValue) => boolean,
): any => {
  const [prev, setPrev] = useState(value);
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    if (prev != value && shouldDelay(prev, value)) {
      const timer = window.setTimeout(() => {
        setDelayedValue(value);
      }, delayMs);

      return () => clearTimeout(timer);
    } else {
      setDelayedValue(value);
    }
    setPrev(value);
  }, [value]);

  return delayedValue;
};

export default useDelayedValueChange;
