import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { first, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import UserPrimarySpace, { UserDefinedSpacePageProps } from ".";

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  if (isUndefined(params)) {
    return {
      props: {
        spaceId: null,
        fid: null,
        handle: null,
        tabName: null,
      },
    };
  }

  const handle = params.handle as string;

  const tabName = params.tabName as string;

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
      .eq("fid", user.fid);

    if (data) {
      const spaceRegistration = first(data);
      if (!isUndefined(spaceRegistration)) {
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
}) satisfies GetServerSideProps<UserDefinedSpacePageProps>;

export default UserPrimarySpace;
