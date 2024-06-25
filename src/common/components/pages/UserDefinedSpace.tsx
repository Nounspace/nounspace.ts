import { findIndex, isNil, mapValues } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import SpaceWithLoader from "../templates/SpaceWithLoader";
import { SpaceConfig } from "../templates/Space";
import { UpdatableSpaceConfig } from "@/common/data/stores/space/spaceStore";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function UserDefinedSpace({
  spaceId: providedSpaceId,
  fid,
}: {
  spaceId: string | null;
  fid: number;
}) {
  const authenticatorManager = useAuthenticatorManager();
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

  useEffect(() => {
    if (!isNil(providedSpaceId)) {
      loadSpace(providedSpaceId);
    }
  }, []);

  const [spaceId, setSpaceId] = useState(providedSpaceId);

  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  useEffect(() => {
    authenticatorManager
      .getInitializedAuthenticators()
      .then((authNames) =>
        setIsSignedIntoFarcaster(
          findIndex(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
        ),
      );
  }, [authenticatorManager]);

  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  useEffect(() => {
    if (!isSignedIntoFarcaster) return;
    authenticatorManager
      .callMethod(
        "root",
        FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
        "getSignerFid",
      )
      .then((authManagerResp) => {
        if (authManagerResp.result === "success") {
          setCurrentUserFid(authManagerResp.value as number);
        }
      });
  }, [isSignedIntoFarcaster, authenticatorManager]);

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

  const config: SpaceConfig = useMemo(
    () =>
      isNil(spaceId)
        ? {
            ...INITIAL_PERSONAL_SPACE_CONFIG,
            isEditable,
          }
        : {
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
          },
    [spaceId, isEditable, localSpaces],
  );

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfig) => {
      if (isNil(currentUserFid)) {
        throw new Error("Attempted to save config when user is not signed in!");
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
      if (isNil(spaceId)) {
        const newSpaceId = await registerSpace(currentUserFid, "profile");
        saveLocalCopy(newSpaceId, saveableConfig);
        setSpaceId(newSpaceId);
      } else {
        saveLocalCopy(spaceId, saveableConfig);
      }
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

  return (
    <SpaceWithLoader
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
    />
  );
}