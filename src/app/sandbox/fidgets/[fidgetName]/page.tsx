import { importFidget } from "@/fidgets";
import React, { use } from "react";

type PageParams = {
  params: {
    fidgetName: string;
  }
};

export default function Page({ params }: PageParams) {
  const { fidget, fieldConfig } = use(importFidget(params.fidgetName));
}