"use client";
import React, { use } from "react";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import UserDefinedSpace from "@/common/components/pages/UserDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import { useUserSpaceContext } from "./context";

export type SpacePageProps = {
  fid: number | null;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
};

export const UserPrimarySpace = async () => {
  const userSpacePromise = useUserSpaceContext();
  const { fid, spaceId, tabName } = use(userSpacePromise);

  useEffect(() => {
    console.log("user primary space: ", fid, spaceId, tabName);
  }, [fid, spaceId, tabName]);

  const { loadEditableSpaces } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (isNil(fid)) {
    console.log("not found", fid);
    return <SpaceNotFound />;
  }

  return (
    <>
      {/* <Head><UserMetadataHtml userMetadata={userMetadata} /></Head> */}
      <UserDefinedSpace
        fid={fid}
        spaceId={spaceId}
        tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      />
    </>
  );
};

export default UserPrimarySpace;
