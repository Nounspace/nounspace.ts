import { indexOf, isNil, mapValues, noop } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import { SpaceConfig } from "../templates/Space";
import { UpdatableSpaceConfig } from "@/common/data/stores/app/space/spaceStore";
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
  const {
    editableSpaces,
    loadSpace,
    remoteSpaces,
    localSpaces,
    saveLocalCopy,
    commitSpaceToDb,
    registerSpace,
  } = useAppStore((state) => ({
    editableSpaces: state.space.editableSpaces,
    loadSpace: state.space.loadSpace,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    saveLocalCopy: state.space.saveLocalSpace,
    commitSpaceToDb: state.space.commitSpaceToDatabase,
    registerSpace: state.space.registerSpace,
  }));
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [loadSuccess, setLoadSuccesss] = useState(false);

  useEffect(() => {
    if (!isNil(providedSpaceId)) {
      loadSpace(providedSpaceId).then((res) => {
        setLoadSuccesss(res !== null);
        setLoading(false);
      });
    }
  }, []);

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
    authManagerCallMethod(
      "root",
      FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      "getAccountFid",
    ).then((authManagerResp) => {
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

  const config: SpaceConfig | undefined = useMemo(() => {
    if (!isNil(spaceId)) {
      if (loading) {
        return undefined;
      }
      if (loadSuccess) {
        return {
          ...localSpaces[spaceId],
          isEditable,
          fidgetInstanceDatums: mapValues(
            localSpaces[spaceId].fidgetInstanceDatums,
            (datum) => ({
              ...datum,
              config: {
                settings: datum.config.settings,
                editable: datum.config.editable,
                data: {}, // TO DO: Inject fidget data here
              },
            }),
          ),
        };
      }
    }
    return {
      ...INITIAL_PERSONAL_SPACE_CONFIG,
      isEditable,
    };
  }, [spaceId, isEditable, localSpaces, loading, loadSuccess]);

  useEffect(() => {
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
      registerSpace(currentUserFid, "profile").then((newSpaceId) =>
        setSpaceId(newSpaceId),
      );
    }
  }, [isEditable, spaceId, currentUserFid]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfig) => {
      if (isNil(currentUserFid)) {
        throw new Error("Attempted to save config when user is not signed in!");
      }
      if (isNil(spaceId)) {
        throw new Error("Cannot save config until space is registered");
      }
      const saveableConfig: UpdatableSpaceConfig = {
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
    />
  );
}
