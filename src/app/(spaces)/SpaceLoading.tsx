"use client";

import React from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

interface Props {
  hasProfile?: boolean;
  hasFeed?: boolean;
}

export default function SpaceLoading({ hasProfile, hasFeed }: Props) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}
