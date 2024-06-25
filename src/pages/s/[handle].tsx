import React from "react";
import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { useAppStore } from "@/common/data/stores";
import { first, isArray, isNil, isNull, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import LoggedInStateManager from "@/common/components/templates/LoggedInStateManager";
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
  } catch {
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
  handle,
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

  return <SpaceNotFound handle={handle} />;
};

UserPrimarySpace.getLayout = (page: React.ReactElement) => {
  return (
    <LoggedInStateManager>
      <div
        className="min-h-screen max-w-screen h-screen w-screen"
        style={{ background: "var(--user-theme-background)" }}
      >
        {page}
      </div>
    </LoggedInStateManager>
  );
};

export default UserPrimarySpace;
