import React from "react";
import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { useAppStore } from "@/common/data/stores/app";
import { first, isArray, isNil, isNull, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import UserDefinedSpace from "@/common/components/pages/UserDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import {
  generateUserMetadataHtml,
  type UserMetadata,
} from "@/common/lib/utils/generateUserMetadataHtml";

export type SpacePageProps = {
  spaceId: string | null;
  tabName: string | string[] | undefined;
  fid: number | null;
  handle: string | string[] | undefined;
  userMetadata?: UserMetadata;
};

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  const handle =
    isUndefined(params) || isUndefined(params.handle) || isArray(params.handle)
      ? null
      : params.handle;

  if (isNull(handle)) {
    return {
      props: {
        spaceId: null,
        fid: null,
        handle: handle,
        tabName: isUndefined(params) ? null : params.tabName,
      },
    };
  }

  try {
    const {
      result: { user },
    } = await neynar.lookupUserByUsername(handle);

    const userMetadata = {
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfp.url,
      bio: user.profile.bio.text,
    };

    const { data } = await supabaseClient
      .from("spaceRegistrations")
      .select("spaceId, spaceName")
      .eq("fid", user.fid);

    if (data) {
      const spaceRegistration = first(data);
      if (!isUndefined(spaceRegistration)) {
        const tabName = spaceRegistration.spaceName;
        return {
          props: {
            spaceId: spaceRegistration.spaceId,
            fid: user.fid,
            handle,
            tabName: tabName,
            userMetadata,
          },
        };
      }
    }

    return {
      props: {
        spaceId: null,
        fid: user.fid,
        handle,
        tabName: null,
        userMetadata,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        spaceId: null,
        fid: null,
        handle,
        tabName: null,
      },
    };
  }
}) satisfies GetServerSideProps<SpacePageProps>;

export const UserPrimarySpace: NextPageWithLayout = ({
  spaceId,
  tabName,
  fid,
  userMetadata,
}: SpacePageProps) => {
  const { loadEditableSpaces } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  useEffect(() => {
    loadEditableSpaces();
  }, []);

<<<<<<< HEAD
  if (!isNil(fid) && !isNil(tabName)) {
    if ((isNil(spaceId) && tabName === "profile") || !isNil(spaceId))
=======
  if (!isNil(fid)) {
    if (
      (isNil(spaceId) && tabName === "profile") ||
      tabName === null ||
      !isNil(spaceId)
    )
>>>>>>> 2e04714 (fix: 404 on users unmade pages)
      return (
        <>
          <Head>{generateUserMetadataHtml(userMetadata)}</Head>
          <UserDefinedSpace
            fid={fid}
            spaceId={spaceId}
            tabName={isArray(tabName) ? tabName[0] : tabName}
          />
        </>
      );
  }

  return <SpaceNotFound />;
};

export default UserPrimarySpace;