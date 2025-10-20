import React from "react";

import HomePage from "../HomePage";

const DEFAULT_TAB_NAME = "Nouns";

type HomeTabPageParams = {
  tabname?: string;
};

type HomeTabPageProps = {
  params: HomeTabPageParams;
};

export default function HomeTabPage({ params }: HomeTabPageProps) {
  const { tabname } = params;

  const decodedTabName = tabname
    ? decodeURIComponent(tabname)
    : DEFAULT_TAB_NAME;

  return <HomePage tabNameFromPath={decodedTabName} />;
}
