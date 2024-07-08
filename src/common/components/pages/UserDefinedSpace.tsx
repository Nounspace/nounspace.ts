import { isNil, mapValues, noop } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import { SpaceConfigSaveDetails } from "../templates/Space";
import Profile from "@/fidgets/ui/profile";
import SpacePage from "./SpacePage";
import { useSpaceConfig } from "@/common/lib/hooks/useCurrentSpaceConfig";
import useCurrentUserFid from "@/common/lib/hooks/useCurrentUserFid";
import useIsSpaceEditable from "@/common/lib/hooks/useIsSpaceEditable";

export default function UserDefinedSpace({
  spaceId: spaceId,
  fid,
}: {
  spaceId: string | null;
  fid: number;
}) {
  const { spaceConfig, loading } = useSpaceConfig(spaceId);

  const { remoteSpaces, saveLocalCopy, commitSpaceToDb, registerSpace } =
    useAppStore((state) => ({
      remoteSpaces: state.space.remoteSpaces,
      saveLocalCopy: state.space.saveLocalSpace,
      commitSpaceToDb: state.space.commitSpaceToDatabase,
      registerSpace: state.space.registerSpace,
    }));
  const currentUserFid = useCurrentUserFid();
  const isEditable = useIsSpaceEditable(spaceId, fid);

  const newSpaceConfigTemplate = useMemo(() => {
    return createIntialPersonSpaceConfigForFid(fid);
  }, [fid]);

  const config = spaceConfig ?? newSpaceConfigTemplate;

  // Create/register a new space if user is authed, on their own profile,
  // and their space hasn't been created yet
  // useEffect(() => {
  //   if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
  //     registerSpace(currentUserFid, "profile").then((newSpaceId) => {
  //       setSpaceId(newSpaceId || null);
  //     });
  //   }
  // }, [isEditable, spaceId, currentUserFid]);

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
        ...newSpaceConfigTemplate,
        isPrivate: false,
      });
    } else {
      saveLocalCopy(spaceId, remoteSpaces[spaceId].config);
    }
  }, [spaceId, newSpaceConfigTemplate, remoteSpaces]);

  const profile = useMemo(
    () => (
      <Profile.fidget
        settings={{ fid }}
        saveData={async () => noop()}
        data={{}}
      />
    ),
    [fid],
  );

  console.log(config, spaceId, fid);

  if (!config) {
    return null;
  }

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
