import React from "react";
import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { useAppStore } from "@/common/data/stores/app";
import { first, isArray, isNil, isNull, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import UserDefinedSpace from "@/common/components/pages/UserDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";

type SpacePageProps = {
  spaceId: string | null;
  fid: number | null;
  handle: string | string[] | undefined;
};

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  const handle =
    isUndefined(params) || isUndefined(params.handle) || isArray(params.handle)
      ? null
      : params.handle;
  if (isNull(handle)) {
    console.log(`Invalid handle in ${params}`);
    return {
      props: {
        spaceId: null,
        fid: null,
        handle: isUndefined(params) ? params : params.handle,
      },
    };
  }

  try {
    const {
      result: { user },
    } = await neynar.lookupUserByUsername(handle);

    console.log(`Found user with ${user.fid} for handle ${handle}`);

    const { data } = await supabaseClient
      .from("spaceRegistrations")
      .select("spaceId")
      .eq("fid", user.fid)
      .eq("isDefault", true);

    if (data) {
      const spaceRegistration = first(data);
      if (!isUndefined(spaceRegistration)) {
        return {
          props: {
            spaceId: spaceRegistration.spaceId,
            fid: user.fid,
            handle,
          },
        };
      }
    }

    return {
      props: {
        spaceId: null,
        fid: user.fid,
        handle,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        spaceId: null,
        fid: null,
        handle,
      },
    };
  }
}) satisfies GetServerSideProps<SpacePageProps>;

const UserPrimarySpace: NextPageWithLayout = ({
  spaceId,
  fid,
}: SpacePageProps) => {
  const { loadEditableSpaces } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (!isNil(fid)) {
    return <UserDefinedSpace fid={fid} spaceId={spaceId} />;
  }

  return <SpaceNotFound />;
};

UserPrimarySpace.getLayout = (page: React.ReactElement) => {
  return (
    <div
      className="min-h-screen max-w-screen h-screen w-screen"
      style={{ background: "var(--user-theme-background)" }}
    >
      {page}
    </div>
  );
};

export default UserPrimarySpace;
