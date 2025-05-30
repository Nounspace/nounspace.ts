import React from "react";
import HomePageClient from "./HomePageClient";
import { SpaceConfig } from "@/app/(spaces)/Space";

interface PageProps {
  params: { tabname?: string };
}

const loadTabConfig = async (tabName: string): Promise<SpaceConfig> => {
  const configModule = await import("@/constants/homePageTabsConfig");
  switch (tabName) {
    case "Nounspace":
      return configModule.NOUNSPACE_TAB_CONFIG;
    case "Press":
      return configModule.PRESS_TAB_CONFIG;
    case "Nouns":
    default:
      return configModule.NOUNS_TAB_CONFIG;
  }
};

export default async function Page({ params }: PageProps) {
  const tabName = params?.tabname ? decodeURIComponent(params.tabname) : "Nouns";
  const tabConfig = await loadTabConfig(tabName);
  return <HomePageClient tabName={tabName} tabConfig={tabConfig} />;
}
