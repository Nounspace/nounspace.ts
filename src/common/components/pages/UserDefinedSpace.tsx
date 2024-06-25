import { findIndex, isNil } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores";
import INITIAL_PERSONAL_SPACE_CONFIG from "@/constants/initialPersonSpace";
import SpaceWithLoader from "../templates/SpaceWithLoader";
import { SpaceConfig } from "../templates/Space";

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
  } = useAppStore((state) => ({
    editableSpaces: state.space.editableSpaces,
    loadSpace: state.space.loadSpace,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    saveLocalCopy: state.space.saveLocalSpace,
    commitSpaceToDb: state.space.commitSpaceToDatabase,
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

  const [spaceId, setSpaceId] = useState(providedSpaceId);

  const config = isNil(spaceId)
    ? {
        ...INITIAL_PERSONAL_SPACE_CONFIG,
        isEditable,
      }
    : localSpaces[spaceId];
  const saveConfig = async (spaceConfig: SpaceConfig) => {};
  const commitConfig = async () => {};
  const resetConfig = async () => {};

  return (
    <SpaceWithLoader
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
    />
  );
}
