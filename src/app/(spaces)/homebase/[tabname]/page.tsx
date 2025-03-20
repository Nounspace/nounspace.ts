"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";

// This component will be the suspense boundary
const HomebaseTab = () => {
  const params = useParams<{ tabname: string }>();
  const tabName = decodeURIComponent(params?.tabname ?? "");

  return <HomebaseContent tabName={tabName} />;
};

// This component will be imported dynamically to trigger suspense
import { lazy } from "react";
const HomebaseContent = lazy(() => import("../PrivateSpace"));

export default HomebaseTab;
