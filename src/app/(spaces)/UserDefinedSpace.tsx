"use client";
import React, { useMemo } from "react";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "./PublicSpace";

export default function UserDefinedSpace({
  spaceId,
  tabName,
  fid,
}: {
  spaceId: string | null;
  tabName: string;
  fid: number;
}) {
  console.log("UserDefinedSpace component mounting with props:", { spaceId, tabName, fid });

  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const INITIAL_PERSONAL_SPACE_CONFIG = useMemo(
    () => createIntialPersonSpaceConfigForFid(fid),
    [fid],
  );

  const getSpacePageUrl = (tabName: string) => `/s/${username}/${tabName}`;

  console.log("UserDefinedSpace rendering with:", { username, INITIAL_PERSONAL_SPACE_CONFIG });

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={tabName}
      initialConfig={INITIAL_PERSONAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      fid={fid}
    />
  );
}