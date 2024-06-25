import { findIndex, isNil, mapValues } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import SpaceWithLoader from "../templates/SpaceWithLoader";
import { SpaceConfig } from "../templates/Space";
import { UpdatableSpaceConfig } from "@/common/data/stores/space/spaceStore";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default async function UserDefinedSpace({
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

  const isSignedIntoFarcaster = await useMemo(
    async () =>
      findIndex(
        await authenticatorManager.getInitializedAuthenticators(),
        FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      ) > -1,
    [authenticatorManager],
  );
  const currentUserFid = await useMemo(async () => {
    if (!isSignedIntoFarcaster) return null;
    const authManagerResp = await authenticatorManager.callMethod(
      "root",
      FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      "getSignerFid",
    );
    if (authManagerResp.result === "success") {
      return authManagerResp.value as number;
    }
    return null;
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

  const [spaceId, setSpaceId] = useState(providedSpaceId);

  const config: SpaceConfig = isNil(spaceId)
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
      };
  const saveConfig = async (spaceConfig: SpaceConfig) => {
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
  };
  const commitConfig = async () => {
    if (isNil(spaceId)) return;
    commitSpaceToDb(spaceId);
  };
  const resetConfig = async () => {
    if (isNil(spaceId)) return;
    if (isNil(remoteSpaces[spaceId])) {
      saveLocalCopy(spaceId, {
        ...INITIAL_PERSONAL_SPACE_CONFIG,
        isPrivate: false,
      });
    } else {
      saveLocalCopy(spaceId, remoteSpaces[spaceId].config);
    }
  };

  return (
    <SpaceWithLoader
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
    />
  );
}
