import { indexOf, isNil, mapValues, noop } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import { SpaceConfigSaveDetails } from "../templates/Space";
import Profile from "@/fidgets/ui/profile";
import SpacePage from "./SpacePage";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function UserDefinedSpace({
  spaceId: providedSpaceId,
  fid,
}: {
  spaceId: string | null;
  fid: number;
}) {
  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const editableSpaces = useAppStore((state) => state.space.editableSpaces);
  const loadSpace = useAppStore((state) => state.space.loadSpace);
  const remoteSpaces = useAppStore((state) => state.space.remoteSpaces);
  const saveLocalCopy = useAppStore((state) => state.space.saveLocalSpace);
  const commitSpaceToDb = useAppStore(
    (state) => state.space.commitSpaceToDatabase,
  );
  const registerSpace = useAppStore((state) => state.space.registerSpace);
  const getCurrentSpaceConfig = useAppStore(
    (state) => state.currentSpace.getCurrentSpaceConfig,
  );
  const setCurrentSpaceId = useAppStore(
    (state) => state.currentSpace.setCurrentSpaceId,
  );

  const [loading, setLoading] = useState(!isNil(providedSpaceId));

  useEffect(() => {
    setCurrentSpaceId(providedSpaceId);
    if (!isNil(providedSpaceId)) {
      setLoading(true);
      loadSpace(providedSpaceId, fid).then(() => {
        setSpaceId(providedSpaceId);
        setLoading(false);
      });
    }
  }, [providedSpaceId]);

  const [spaceId, setSpaceId] = useState(providedSpaceId);

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

  useEffect(() => {
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
      registerSpace(currentUserFid, "profile").then((newSpaceId) => {
        setSpaceId(newSpaceId || null);
      });
    }
  }, [isEditable, spaceId, currentUserFid]);

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
      await saveLocalCopy(spaceId, saveableConfig);
    },
    [currentUserFid, spaceId],
  );

  const commitConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    commitSpaceToDb(spaceId);
  }, [spaceId]);

  const resetConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    if (isNil(remoteSpaces[spaceId])) {
      saveLocalCopy(spaceId, {
        ...INITIAL_PERSONAL_SPACE_CONFIG,
        isPrivate: false,
      });
    } else {
      saveLocalCopy(spaceId, remoteSpaces[spaceId].config);
    }
  }, [spaceId, INITIAL_PERSONAL_SPACE_CONFIG, remoteSpaces]);

  const profile = (
    <Profile.fidget
      settings={{ fid }}
      saveData={async () => noop()}
      data={{}}
    />
  );

  return (
    <SpacePage
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      profile={profile}
      loading={loading}
    />
  );
}
