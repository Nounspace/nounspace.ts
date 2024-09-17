import { indexOf, isNil, mapValues, noop, first } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import { SpaceConfigSaveDetails } from "../templates/Space";
import Profile from "@/fidgets/ui/profile";
import TabBar from "../organisms/TabBar";
import SpacePage from "./SpacePage";
import router from "next/router";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useSidebarContext } from "../organisms/Sidebar";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function UserDefinedSpace({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  fid,
}: {
  spaceId: string | null;
  tabName: string;
  fid: number;
}) {
  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();
  const {
    editableSpaces,
    localSpaces,
    remoteSpaces,
    loadSpaceTab,
    saveLocalSpaceTab,
    commitSpaceTab,
    registerSpace,
    getCurrentSpaceConfig,
    setCurrentSpaceId,

    loadSpaceTabOrder,
    updateSpaceTabOrder,
    commitSpaceTabOrder,
    createSpaceTab,
    deleteSpaceTab,
  } = useAppStore((state) => ({
    editableSpaces: state.space.editableSpaces,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    currentSpaceId: state.currentSpace.currentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,

    // TODO: update these two to work with tabs?
    registerSpace: state.space.registerSpace,
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,

    loadSpaceTab: state.space.loadSpaceTab,
    createSpaceTab: state.space.createSpaceTab,
    deleteSpaceTab: state.space.deleteSpaceTab,
    saveLocalSpaceTab: state.space.saveLocalSpaceTab,
    commitSpaceTab: state.space.commitSpaceTabToDatabase,

    loadSpaceTabOrder: state.space.loadSpaceTabOrder,
    updateSpaceTabOrder: state.space.updateLocalSpaceOrder,
    commitSpaceTabOrder: state.space.commitSpaceOrderToDatabase,
  }));
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [spaceId, setSpaceId] = useState(providedSpaceId);

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    setCurrentSpaceId(providedSpaceId);
    if (!isNil(providedSpaceId)) {
      setLoading(true);
      loadSpaceTab(providedSpaceId, providedTabName).then(() => {
        setSpaceId(providedSpaceId);
        setLoading(false);
      });
    }
  }, [providedSpaceId, providedTabName]);

  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
      );
    });
  }, [authManagerLastUpdatedAt]);

  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIntoFarcaster) return;
    authManagerCallMethod({
      requestingFidgetId: "root",
      authenticatorId: FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      methodName: "getAccountFid",
      isLookup: true,
    }).then((authManagerResp) => {
      if (authManagerResp.result === "success") {
        setCurrentUserFid(authManagerResp.value as number);
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  const isEditable = useMemo(() => {
    return (
      (isNil(spaceId) && fid === currentUserFid) ||
      (!isNil(spaceId) && spaceId in editableSpaces)
    );
  }, [editableSpaces, currentUserFid]);

  const INITIAL_PERSONAL_SPACE_CONFIG = useMemo(
    () => createIntialPersonSpaceConfigForFid(fid),
    [fid],
  );

  const currentConfig = getCurrentSpaceConfig();

  const config = useMemo(
    () => ({
      ...(currentConfig ? currentConfig : INITIAL_PERSONAL_SPACE_CONFIG),
      isEditable,
    }),
    [currentConfig, isEditable],
  );

  // Creates a new "profile" space for the user when they're eligible to edit but don't have an existing space ID.
  // This ensures that new users or users without a space get a default profile space created for them.
  useEffect(() => {
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
      registerSpace(currentUserFid, "profile").then((newSpaceId) => {
        if (newSpaceId) {
          setSpaceId(newSpaceId);
          setCurrentSpaceId(newSpaceId);
        }
      });
    }
  }, [isEditable, spaceId, currentUserFid, providedTabName]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      if (isNil(currentUserFid)) {
        throw new Error("Attempted to save config when user is not signed in!");
      }
      if (isNil(spaceId)) {
        throw new Error("Cannot save config until space is registered");
      }
      const saveableConfig = {
        ...spaceConfig,
        fidgetInstanceDatums: mapValues(
          spaceConfig.fidgetInstanceDatums,
          (datum) => ({
            ...datum,
            config: {
              settings: datum.config.settings,
              editable: datum.config.editable,
            },
          }),
        ),
        isPrivate: false,
      };
      // Save the configuration locally
      await saveLocalSpaceTab(spaceId, providedTabName, saveableConfig);
    },
    [currentUserFid, spaceId],
  );

  const commitConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    commitSpaceTab(spaceId, providedTabName);
  }, [spaceId]);

  // Resets the configuration of a space tab.
  // If no remote configuration exists, it sets the tab to the initial personal space config.
  // Otherwise, it restores the tab to its last saved remote state.
  const resetConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    if (isNil(remoteSpaces[spaceId])) {
      saveLocalSpaceTab(spaceId, providedTabName, {
        ...INITIAL_PERSONAL_SPACE_CONFIG,
        isPrivate: false,
      });
    } else {
      saveLocalSpaceTab(
        spaceId,
        providedTabName,
        remoteSpaces[spaceId].tabs[providedTabName],
      );
    }
  }, [spaceId, INITIAL_PERSONAL_SPACE_CONFIG, remoteSpaces, providedTabName]);

  const profile = (
    <Profile.fidget
      settings={{ fid }}
      saveData={async () => noop()}
      data={{}}
    />
  );

  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  function switchTabTo(tabName: string) {
    if (tabName !== "Feed") {
      router.push(`/s/${username}/${tabName}`);
    }
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      inHomebase={false}
      currentTab={providedTabName}
      tabList={spaceId ? localSpaces[spaceId]?.order : []}
      switchTabTo={switchTabTo}
      updateTabOrder={(newOrder) =>
        spaceId && updateSpaceTabOrder(spaceId, newOrder)
      }
      inEditMode={editMode}
      deleteTab={(tabName) => spaceId && deleteSpaceTab(spaceId, tabName)}
      createTab={(tabName) => spaceId && createSpaceTab(spaceId, tabName)}
      renameTab={(oldName, newName) =>
        spaceId && saveLocalSpaceTab(spaceId, oldName, config, newName)
      }
      commitTab={(tabName) => spaceId && commitSpaceTab(spaceId, tabName)}
      commitTabOrder={() => spaceId && commitSpaceTabOrder(spaceId)}
    />
  );

  return (
    <SpacePage
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      profile={profile}
      tabBar={tabBar}
      loading={loading}
    />
  );
}
