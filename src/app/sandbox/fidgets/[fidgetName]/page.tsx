import React from "react";
import FidgetViewer from "@/common/fidgets/FidgetViewer";
import CompleteFidgets from "@/fidgets";
import { GenericFidget } from "@/common/fidgets/makeFidget";

type PageParams = {
  params: {
    fidgetName: string;
  }
};

export default function Page({ params }: PageParams) {
  const fidget = CompleteFidgets[params.fidgetName] as GenericFidget;

  return (
  <>
    {
      fidget ? <FidgetViewer fidget={fidget} /> : <div>Error Loading Fidget</div>
    }
  </>
  );
}