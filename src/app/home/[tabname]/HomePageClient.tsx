"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import TabBar from "@/common/components/organisms/TabBar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { SpaceConfig } from "@/app/(spaces)/Space";

interface HomePageClientProps {
  tabName: string;
  tabConfig: SpaceConfig;
}

const HomePageClient = ({ tabName, tabConfig }: HomePageClientProps) => {
  const router = useRouter();
  const isLoggedIn = useAppStore((state) => state.getIsAccountReady());
  const isInitializing = useAppStore((state) => state.getIsInitializing());

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Nouns", "Nounspace", "Press"];

  function switchTabTo(newTabName: string) {
    router.push(`/home/${newTabName}`);
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
    />
  );

  const args: SpacePageArgs = isInitializing
    ? {
        config: { ...INITIAL_SPACE_CONFIG_EMPTY, isEditable: false },
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => {},
        tabBar: tabBar,
      }
    : !isLoggedIn
      ? {
          config: tabConfig,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        }
      : {
          config: tabConfig,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        };

  return <SpacePage key={tabName} {...args} />;
};

export default HomePageClient;
