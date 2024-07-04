import { useState } from "react";

export const useValueHistory = <T>(
  value: T,
  limit: number,
): [T, ...Array<T | undefined>] => {
  const [values, setValues] = useState([
    value,
    ...Array(limit - 1).map((v) => undefined),
  ]);
  const current = values[0];

  if (value !== current) {
    setValues([value, ...values.slice(0, -1)]);
  }

  return values as [T, ...Array<T | undefined>];
};

export default useValueHistory;
