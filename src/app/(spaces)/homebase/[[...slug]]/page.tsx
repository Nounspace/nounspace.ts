"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrivateSpace from "../PrivateSpace";

const HomebaseDynamicPage = () => {
  const params = useParams<{ slug?: string[] }>();
  const segments = params?.slug || [];

  let tabName = 'Feed';
  let castHash: string | undefined;

  if (segments && Array.isArray(segments)) {
    if (segments.length === 1) {
      tabName = decodeURIComponent(segments[0]);
    } else if (segments.length >= 3 && segments[0] === 'c') {
      castHash = decodeURIComponent(segments[2]);
    } else if (segments.length >= 2) {
      castHash = decodeURIComponent(segments[1]);
    }
  }

  console.log(`HomebaseDynamicPage: Rendering tab ${tabName} with castHash: ${castHash || 'none'}`);
  return <PrivateSpace key={tabName} tabName={tabName} castHash={castHash} />;
};

export default HomebaseDynamicPage;
