"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrivateSpace from "../PrivateSpace";

const HomebaseDynamicPage = () => {
  const params = useParams<{ slug: string[] }>();
  const segments = params?.slug || [];

  if (segments.length === 1) {
    const tabName = decodeURIComponent(segments[0]);
    return <PrivateSpace tabName={tabName} />;
  }

  if (segments.length >= 2) {
    const castHash = decodeURIComponent(segments[1]);
    return <PrivateSpace tabName="Feed" castHash={castHash} />;
  }

  return <PrivateSpace tabName="Feed" />;
};

export default HomebaseDynamicPage;
