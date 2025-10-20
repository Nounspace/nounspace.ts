import React from "react";

import HomePage from "../HomePage";

const DEFAULT_TAB_NAME = "Nouns";

type HomeTabPageProps = {
  params: {
    tabname?: string;
  };
};

export default function HomeTabPage({ params }: HomeTabPageProps) {
  const decodedTabName = params.tabname
    ? decodeURIComponent(params.tabname)
    : DEFAULT_TAB_NAME;

  return <HomePage tabNameFromPath={decodedTabName} />;
}
