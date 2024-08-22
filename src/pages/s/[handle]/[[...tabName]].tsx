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

type SpacePageProps = {
  spaceId: string | null;
  fid: number | null;
  handle: string | string[] | undefined;
  tabName: string | string[] | undefined;
  userMetadata?: UserMetadata;
};

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  const handle =
    isUndefined(params) || isUndefined(params.handle) || isArray(params.handle)
      ? null
      : params.handle;

  const tabNameParam = isUndefined(params)
    ? undefined
    : (params.tabName as string[]);

  if (isNull(handle)) {
    return {
      props: {
        spaceId: null,
        fid: null,
        handle: isUndefined(params) ? params : params.handle,
        tabName: isUndefined(params) ? params : params.tabName,
      },
    };
  }

  if (isArray(tabNameParam) && tabNameParam.length > 1) {
    return {
      props: {
        spaceId: null,
        fid: null,
        handle: isUndefined(params) ? params : params.handle,
        tabName: tabNameParam,
      },
    };
  }

  const tabName = isUndefined(tabNameParam) ? "profile" : tabNameParam[0];

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
      .select("spaceId")
      .eq("fid", user.fid)
      .eq("spaceName", tabName);

    if (data) {
      const spaceRegistration = first(data);
      if (!isUndefined(spaceRegistration)) {
        return {
          props: {
            spaceId: spaceRegistration.spaceId,
            fid: user.fid,
            handle,
            tabName: tabName,
            userMetadata: {
              username: user.username,
              displayName: user.displayName,
              pfpUrl: user.pfp.url,
              bio: user.profile.bio.text,
            },
          },
        };
      }
    }

    return {
      props: {
        spaceId: null,
        fid: user.fid,
        handle,
        tabName: tabName,
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
        tabName: tabName,
      },
    };
  }
}) satisfies GetServerSideProps<SpacePageProps>;

const UserPrimarySpace: NextPageWithLayout = ({
  spaceId,
  fid,
  tabName,
  userMetadata,
}: SpacePageProps) => {
  const loadEditableSpaces = useAppStore(
    (state) => state.space.loadEditableSpaces,
  );

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (!isNil(fid)) {
    if ((isNil(spaceId) && tabName === "profile") || !isNil(spaceId))
      return (
        <>
          <Head>{generateUserMetadataHtml(userMetadata)}</Head>
          <UserDefinedSpace fid={fid} spaceId={spaceId} />
        </>
      );
  }

  return <SpaceNotFound />;
};

export default UserPrimarySpace;
