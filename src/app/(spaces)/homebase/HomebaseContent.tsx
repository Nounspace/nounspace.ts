"use client";

import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import FeedModule, { FilterType } from "@/fidgets/farcaster/Feed";
import { FeedType } from "@neynar/nodejs-sdk";
import { isNil, noop } from "lodash";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";
import { createResource } from "./utils";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";

interface HomebaseContentProps {
  tabName?: string;
}

// Define a type for the resource
type Resource<T> = {
  read: () => T;
};

const TabBar = lazy(() => import('@/common/components/organisms/TabBar'));

function HomebaseContentComponent({ tabName = "Feed" }: HomebaseContentProps) {
  const {
    tabConfigs,
    homebaseConfig,
    loadTab,
    saveTab,
    commitTab,
    resetTab,
    saveConfig,
    loadConfig,
    commitConfig,
    resetConfig,
    setCurrentSpaceId,
    setCurrentTabName,
    loadTabNames,
    tabOrdering,
    getIsLoggedIn,
    loadTabOrder,
    updateTabOrder,
    createTab,
    deleteTab,
    renameTab,
    commitTabOrder,
  } = useAppStore((state) => ({
    tabConfigs: state.homebase.tabs,
    homebaseConfig: state.homebase.homebaseConfig,
    loadTab: state.homebase.loadHomebaseTab,
    saveTab: state.homebase.saveHomebaseTabConfig,
    commitTab: state.homebase.commitHomebaseTabToDatabase,
    resetTab: state.homebase.resetHomebaseTabConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsLoggedIn: state.getIsAccountReady,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    tabOrdering: state.homebase.tabOrdering,
    loadTabNames: state.homebase.loadTabNames,
    loadTabOrder: state.homebase.loadTabOrdering,
    updateTabOrder: state.homebase.updateTabOrdering,
    commitTabOrder: state.homebase.commitTabOrderingToDatabase,
    createTab: state.homebase.createTab,
    deleteTab: state.homebase.deleteTab,
    renameTab: state.homebase.renameTab,
  }));

  const router = useRouter();
  const isLoggedIn = getIsLoggedIn();
  const currentFid = useCurrentFid();
  const isFeedTab = tabName === "Feed";
  
  // Use the Resource type in useState
  const [configResource, setConfigResource] = useState<Resource<any> | null>(null);

  useEffect(() => {
    setCurrentSpaceId(HOMEBASE_ID);
    setCurrentTabName(tabName);
    
    if (isLoggedIn) {
      const loadData = async () => {
        await loadTabNames();
        
        if (tabOrdering.local.length === 0) {
          await loadTabOrder();
        }
        
        let config;
        
        if (isFeedTab) {
          config = await loadConfig();
        } else if (!isNil(tabName)) {
          config = await loadTab(tabName);
          
          const tabOrder = tabOrdering.local || [];
          for (const tab of tabOrder) {
            if (tabName !== tab && tab !== "Feed") {
              loadTab(tab);
            }
          }
        }
        
        return config;
      };
      
      setConfigResource(createResource(loadData()));
    }
  }, [isLoggedIn, tabName]);

  const config = configResource ? configResource.read() : null;

  const memoizedConfig = useMemo(() => {
    if (!config) return INITIAL_SPACE_CONFIG_EMPTY;
    
    if (!isFeedTab) {
      const { timestamp, ...restConfig } = config;
      return restConfig;
    }
    
    return config;
  }, [
    config?.fidgetInstanceDatums,
    config?.layoutID,
    config?.layoutDetails,
    config?.isEditable,
    config?.fidgetTrayContents,
    config?.theme,
    isFeedTab,
  ]);

  function switchTabTo(newTabName: string) {
    if (newTabName === "Feed") {
      router.push(`/homebase`);
    } else {
      router.push(`/homebase/${newTabName}`);
    }
  }

  function getSpacePageUrl(tabName: string) {
    if (tabName === "Feed") {
      return `/homebase`;
    }
    return `/homebase/${tabName}`;
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <Suspense fallback={<TabBarSkeleton />}>
      <TabBar
        getSpacePageUrl={getSpacePageUrl}
        inHomebase={true}
        currentTab={tabName}
        tabList={tabOrdering.local}
        switchTabTo={switchTabTo}
        updateTabOrder={updateTabOrder}
        inEditMode={editMode}
        deleteTab={deleteTab}
        createTab={createTab}
        renameTab={renameTab}
        commitTabOrder={commitTabOrder}
        commitTab={commitTab}
      />
    </Suspense>
  );

  const resetConfigHandler = async () => {
    if (isFeedTab) {
      resetConfig();
    } else {
      resetTab(tabName);
    }
    return Promise.resolve();
  };

  const commitConfigHandler = async () => {
    if (isFeedTab) {
      await commitConfig();
    } else {
      await commitTab(tabName);
    }
    
    await commitTabOrder();
    for (const tab of tabOrdering.local) {
      if (tab !== tabName && tab !== "Feed") {
        await commitTab(tab);
      }
    }
  };

  const saveConfigHandler = async (configToSave) => {
    if (isFeedTab) {
      await saveConfig(configToSave);
    } else {
      await saveTab(tabName, configToSave);
    }
    return commitConfigHandler();
  };

  const args: SpacePageArgs = !isLoggedIn
    ? {
        config: memoizedConfig ?? undefined,
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => Promise.resolve(),
        tabBar: tabBar,
      }
    : {
        config: memoizedConfig,
        saveConfig: saveConfigHandler,
        commitConfig: commitConfigHandler,
        resetConfig: resetConfigHandler,
        tabBar: tabBar,
      };

  if (isFeedTab && currentFid) {
    args.feed = (
      <FeedModule.fidget
        settings={{
          feedType: FeedType.Following,
          users: "",
          filterType: FilterType.Users,
          selectPlatform: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
          Xhandle: "",
          style: "",
          fontFamily: "var(--user-theme-font)",
          fontColor: "var(--user-theme-font-color)" as any,
        }}
        saveData={async () => noop()}
        data={{}}
      />
    );
  }

  return (
    <SpacePage key={tabName} {...args} />
  );
}

export default HomebaseContentComponent; 