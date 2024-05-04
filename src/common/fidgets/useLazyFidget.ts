import { useState, useEffect } from "react";
import { GenericFidget } from "@/common/fidgets/makeFidget";

type LazyFidgetResult<T> = T | Error | null;
type LazyFidgetStatus = "Loading" | "Error" | "Success";

type LazyFidgetPending = {
  status: "Loading",
  result: null,
}

type LazyFidgetError = {
  status: "Error",
  result: Error,
}

type LazyFidgetLoaded<T> = {
  status: "Success",
  result: T,
}

export type LazyFidget<T extends GenericFidget> = LazyFidgetError | LazyFidgetPending | LazyFidgetLoaded<T>;

export function useLazyFidget<T extends GenericFidget>(fidgetPath: string): LazyFidget<T> {
  const [result, setResult] = useState<LazyFidgetResult<T>>(null);
  const [status, setStatus] = useState<LazyFidgetStatus>("Loading");

  useEffect(() => {
      import(fidgetPath).then(
      moduleData => {
        setResult(moduleData.default);
        setStatus("Success");
      },
      error => {
        setResult(error);
        setStatus("Error");
        console.log(error);
      }
    );
  }, []);
  
  return {
    status, result
  } as LazyFidget<T>;
}