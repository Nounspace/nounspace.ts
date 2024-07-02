import React, { useMemo } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import { CgProfile } from "react-icons/cg";
import { User } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { first, isUndefined } from "lodash";
import FarcasterLinkify from "../farcaster/components/linkify";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useFarcasterSigner } from "../farcaster";
import { followUser, unfollowUser } from "../farcaster/utils";
import { Button } from "@/common/components/atoms/button";

export type ProfileFidgetSettings = {
  fid: number;
};

const profileProperties: FidgetProperties = {
  fidgetName: "profile",
  icon: 0x1f464, // This is the hex code for an emoji
  fields: [
    {
      fieldName: "fid",
      default: null,
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const Profile: React.FC<FidgetArgs<ProfileFidgetSettings>> = ({
  settings: { fid },
}) => {
  const { fid: viewerFid, signer } = useFarcasterSigner("profile");
  const { data: userData } = useLoadFarcasterUser(
    fid,
    viewerFid > 0 ? viewerFid : undefined,
  );

  const user: User | undefined = useMemo(() => {
    if (isUndefined(userData)) {
      return undefined;
    }
    return first(userData.users);
  }, [userData]);

  const toggleFollowing = async () => {
    if (user && signer && viewerFid > 0) {
      if (user?.viewer_context?.following) {
        unfollowUser(fid, viewerFid, signer);
      } else {
        followUser(fid, viewerFid, signer);
      }
    }
  };

  if (isUndefined(user)) {
    return (
      <div className="flex flex-row h-full overflow-auto p-6 animate-pulse">
        <div className="h-full max-h-24 max-w-24">
          <CgProfile className="text-gray-200 dark:text-gray-700 me-4 aspect-square rounded-full max-h-full h-full w-full"></CgProfile>
        </div>
        <div className="w-4/6 flex flex-col pl-6">
          <div className="flex flex-col">
            <span className="w-full h-5 bg-gray-200 rounded-full dark:bg-gray-700 m-1"></span>
            <small className="w-20 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 m-1"></small>
          </div>
          <div className="flex flex-row text-sm">
            <p className="mr-6 w-20 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 m-1"></p>
            <p className="w-20 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 m-1"></p>
          </div>
          <div className="text-sm mt-4 w-full h-10 bg-gray-200 rounded-full dark:bg-gray-700 "></div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-row h-full overflow-auto p-6">
      <div className="h-full max-h-24 max-w-24">
        {user.pfp_url ? (
          <img
            className="aspect-square rounded-full max-h-full object-cover"
            src={user.pfp_url}
          />
        ) : (
          <CgProfile className="text-gray-200 dark:text-gray-700 me-4 aspect-square rounded-full max-h-full h-full w-full"></CgProfile>
        )}
      </div>
      <div className="w-4/6 flex flex-col pl-6">
        <div className="flex flex-row">
          <div className="w-4/6 flex flex-col">
            <span className="w-full text-xl">
              {user.display_name || user.username}
            </span>
            <small className="text-slate-500">@{user.username}</small>
          </div>
          <div className="ml-4 flex w-full h-full items-center">
            {user.viewer_context && fid !== viewerFid && (
              <Button
                onClick={toggleFollowing}
                variant={
                  user.viewer_context?.following ? "secondary" : "primary"
                }
              >
                {user.viewer_context?.following ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-row text-sm">
          <p className="mr-6">{user.following_count} Following</p>
          <p>{user.follower_count} Followers</p>
        </div>
        <p className="text-sm mt-4">
          <FarcasterLinkify>{user.profile.bio.text}</FarcasterLinkify>
        </p>
      </div>
    </div>
  );
};

export default {
  fidget: Profile,
  properties: profileProperties,
} as FidgetModule<FidgetArgs<ProfileFidgetSettings>>;
