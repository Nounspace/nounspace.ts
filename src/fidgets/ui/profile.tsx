import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import { User } from "@neynar/nodejs-sdk/build/api";
import { first, isUndefined } from "lodash";
import React, { useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { useFarcasterSigner } from "../farcaster";
import FarcasterLinkify from "../farcaster/components/linkify";
import { followUser, unfollowUser } from "../farcaster/utils";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { IoLocationOutline } from "react-icons/io5";
import { BsPerson, BsPersonFill } from "react-icons/bs";

export type ProfileFidgetSettings = {
  fid: number;
};

const profileProperties: FidgetProperties = {
  fidgetName: "Profile",
  icon: 0x1f464, // This is the hex code for an emoji
  mobileIcon: <BsPerson size={24} />,
  mobileIconSelected: <BsPersonFill size={24} />,
  fields: [
    {
      fieldName: "fid",
      default: null,
      required: true,
      inputSelector: TextInput,
    },
    ...defaultStyleFields,
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
  const isMobile = useIsMobile();
  const { fid: viewerFid, signer } = useFarcasterSigner("Profile");
  const { data: userData } = useLoadFarcasterUser(
    fid,
    viewerFid > 0 ? viewerFid : undefined
  );

  const [actionStatus, setActionStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user: User | undefined = useMemo(() => {
    if (isUndefined(userData)) {
      return undefined;
    }
    return first(userData.users);
  }, [userData]);

  // console.log("user", user);

  const toggleFollowing = async () => {
    if (user && signer && viewerFid > 0) {
      setActionStatus("loading");

      // Optimistically update the user's following state
      const wasFollowing = user.viewer_context?.following ?? false;
      user.viewer_context = {
        following: !wasFollowing,
        followed_by: user.viewer_context?.followed_by ?? false,
        blocking: user.viewer_context?.blocking ?? false,
        blocked_by: user.viewer_context?.blocked_by ?? false,
      };

      try {
        let success;
        if (wasFollowing) {
          success = await unfollowUser(fid, viewerFid, signer);
        } else {
          success = await followUser(fid, viewerFid, signer);
        }

        if (!success) {
          throw new Error("Failed to update follow status.");
        }
      } catch (error) {
        // Revert the optimistic update if the operation fails
        user.viewer_context = {
          ...user.viewer_context,
          following: wasFollowing,
        };
        setActionStatus("error");
        setErrorMessage("An error occurred while updating follow status.");
      } finally {
        // Reset status after some delay
        setTimeout(() => setActionStatus("idle"), 3000);
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

  // Extract location if available
  // DISABLE: @_ts-expect-error > maybe update the neynar package solves this
  const location = user.profile?.location?.address?.city || "";
  // const location = 'teste';
  const hasLocation = location.length > 0;

  return (
    <div className="flex flex-row items-start gap-3 p-3 sm:p-4 justify-start">
      <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14">
        {user.pfp_url ? (
          <img
            className="aspect-square rounded-full max-h-full object-cover"
            src={user.pfp_url}
          />
        ) : (
          <CgProfile className="text-gray-200 dark:text-gray-700 aspect-square rounded-full max-h-full h-full w-full"></CgProfile>
        )}
      </div>
      <div className="flex flex-col w-full items-start">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm sm:text-base md:text-lg font-bold leading-tight">
              {user.display_name || user.username}
            </span>
            <small className="block text-[10px] sm:text-xs md:text-sm text-slate-500 leading-tight">
              @{user.username}
            </small>
          </div>
          {user.viewer_context && fid !== viewerFid && (
            <Button
              onClick={toggleFollowing}
              variant={
                user.viewer_context?.following ? "secondary" : "primary"
              }
              disabled={actionStatus === "loading"}
              className="text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-0"
            >
              {actionStatus === "loading"
                ? "Loading..."
                : user.viewer_context?.following
                  ? "Unfollow"
                  : "Follow"}
            </Button>
          )}
        </div>

        <p className="text-[10px] sm:text-xs md:text-sm mt-2 text-slate-700 text-left w-full block">
          <FarcasterLinkify>{user.profile.bio.text}</FarcasterLinkify>
        </p>

        <div className="flex flex-wrap items-center text-[10px] sm:text-xs md:text-sm mt-2 gap-3 text-slate-500">
          <p>
            <span className="font-bold">{user.following_count}</span> Following
          </p>
          <p>
            <span className="font-bold">{user.follower_count}</span> Followers
          </p>
          {hasLocation && (
            <p className="flex items-center gap-1">
              <IoLocationOutline /> {location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default {
  fidget: Profile,
  properties: profileProperties,
} as FidgetModule<FidgetArgs<ProfileFidgetSettings>>;
