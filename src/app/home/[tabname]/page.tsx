import React from "react";
import type { UnsafeUnwrappedParams } from "next/dist/server/request/params";

import HomePage from "../HomePage";

const DEFAULT_TAB_NAME = "Nouns";

type HomeTabPageParams = {
  tabname?: string;
};

type HomeTabPageProps = {
  params: Promise<HomeTabPageParams>;
};

type UnwrappedHomeTabPageParams = UnsafeUnwrappedParams<HomeTabPageProps["params"]>;

export default function HomeTabPage({ params }: HomeTabPageProps) {
  const { tabname } = params as unknown as UnwrappedHomeTabPageParams;

  const decodedTabName = tabname
    ? decodeURIComponent(tabname)
    : DEFAULT_TAB_NAME;

  return <HomePage tabNameFromPath={decodedTabName} />;
}
