"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import { SpaceConfig } from "@/app/(spaces)/Space";
import TabBar from "@/common/components/organisms/TabBar";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

import {
  RESOURCES_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
  PLACES_TAB_CONFIG,
} from "./homePageTabsConfig";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

const DEFAULT_TAB_ORDER = [
  "Nouns",
  "Social",
  "Governance",
  "Resources",
  "Funded Works",
  "Places",
];

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Governance":
      return GOVERNANCE_TAB_CONFIG;
    case "Resources":
      return RESOURCES_TAB_CONFIG;
    case "Funded Works":
      return FUNDED_WORKS_TAB_CONFIG;
    case "Social":
      return SOCIAL_TAB_CONFIG;
    case "Places":
      return PLACES_TAB_CONFIG;
    case "Nouns":
    default:
      return NOUNS_TAB_CONFIG;
  }
};

type HomeClientProps = {
  initialTabName: string;
  nounsContent: ReactNode;
};

const sanitizeTabName = (value: string | undefined) => {
  if (!value) return "Nouns";
  const decoded = decodeURIComponent(value);
  return DEFAULT_TAB_ORDER.includes(decoded) ? decoded : "Nouns";
};

const HomeClient = ({ initialTabName, nounsContent }: HomeClientProps) => {
  const router = useRouter();
  const { getIsInitializing, setCurrentTabName } = useAppStore((state) => ({
    getIsInitializing: state.getIsInitializing,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
  }));
  const isInitializing = getIsInitializing();

  const [tabName, setTabName] = useState(() => sanitizeTabName(initialTabName));
  const tabOrdering = useMemo(() => DEFAULT_TAB_ORDER, []);

  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    const sanitized = sanitizeTabName(initialTabName);
    setTabName(sanitized);
    setCurrentTabName(sanitized);
  }, [initialTabName, setCurrentTabName]);

  function switchTabTo(newTabName: string) {
    const sanitized = sanitizeTabName(newTabName);
    setCurrentTabName(sanitized);
    router.push(`/home/${encodeURIComponent(sanitized)}`);
  }

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHomebase={false}
      currentTab={tabName}
      tabList={tabOrdering}
      switchTabTo={switchTabTo}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName })}
      renameTab={async () => Promise.resolve({ tabName })}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
      isEditable={false}
    />
  );

  if (tabName === "Nouns") {
    return (
      <div className="flex w-full flex-col gap-6">
        {tabBar}
        <div className="flex w-full justify-center bg-white">
          <div className="w-full">{nounsContent}</div>
        </div>
      </div>
    );
  }

  const args: SpacePageArgs = isInitializing
    ? {
        config: {
          ...INITIAL_SPACE_CONFIG_EMPTY,
          isEditable: false,
        } as SpaceConfig,
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => {},
        tabBar,
        showFeedOnMobile: false,
      }
    : {
        config: getTabConfig(tabName) as SpaceConfig,
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => {},
        tabBar,
        showFeedOnMobile: false,
      };

  return <SpacePage key={tabName} {...args} />;
};

export default HomeClient;
