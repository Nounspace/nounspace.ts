import React from "react";
import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { useAppStore } from "@/common/data/stores/app";
import { first, isArray, isNil, isNull, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import UserDefinedSpace from "@/common/components/pages/UserDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";

type SpacePageProps = {
  spaceId: string | null;
  fid: number | null;
  handle: string | string[] | undefined;
  tabName: string | string[] | undefined;
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
}: SpacePageProps) => {
  const { loadEditableSpaces } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  console.log(spaceId, fid, tabName);

  if (!isNil(fid)) {
    if ((isNil(spaceId) && tabName === "profile") || !isNil(spaceId))
      return <UserDefinedSpace fid={fid} spaceId={spaceId} />;
  }

  return <SpaceNotFound />;
};

export default UserPrimarySpace;
