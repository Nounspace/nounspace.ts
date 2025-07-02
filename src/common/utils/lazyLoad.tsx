"use client";

import React, { Suspense, lazy } from "react";

interface LazyLoadProps {
  importFunc: () => Promise<any>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const LazyLoad = ({ importFunc, fallback = <div>Loading...</div>, props = {} }: LazyLoadProps) => {
  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
