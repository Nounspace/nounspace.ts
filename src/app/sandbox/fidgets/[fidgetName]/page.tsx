"use client";
import React from "react";
import FidgetViewer from "@/common/fidgets/FidgetViewer";
import { CompleteFidgets } from "@/fidgets";
import { FidgetModule } from "@/common/fidgets";

type PageParams = {
  params: {
    fidgetName: string;
  };
};

export default function Page({ params }: PageParams) {
  const fidgetModule = CompleteFidgets[params.fidgetName] as FidgetModule;

  return <>{fidgetModule ? <FidgetViewer fidgetModule={fidgetModule} /> : <div>Error Loading Fidget</div>}</>;
}
