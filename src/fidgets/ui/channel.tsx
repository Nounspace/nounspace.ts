import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import TextInput from "@/common/components/molecules/TextInput";
import {
  useChannelById,
  useChannelFollowers,
  useChannelMembers,
  useChannelRelevantFollowers,
} from "@/common/data/queries/farcaster";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { defaultStyleFields } from "@/fidgets/helpers";
import clsx from "clsx";
import { first, take } from "lodash";
import React, { useMemo } from "react";

export type ChannelFidgetSettings = {
  channelId: string;
};

const channelProperties: FidgetProperties = {
  fidgetName: "Channel",
  icon: 0x1f4f0,
  mobileIcon: undefined,
  fields: [
    {
      fieldName: "channelId",
      displayName: "Channel",
      displayNameHint: "Enter the Farcaster channel ID (without the leading slash).",
      default: "",
      required: true,
      inputSelector: TextInput,
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 4,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const SkeletonSection: React.FC = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
  </div>
);

const SectionHeading: React.FC<{ title: string; count?: number }> = ({
  title,
  count,
}) => (
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
    <span>{title}</span>
    {typeof count === "number" && (
      <span className="text-slate-600 dark:text-slate-300">{count.toLocaleString()}</span>
    )}
  </div>
);

type SimpleUser = {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
};

const toSimpleUser = (
  user?: {
    fid?: number;
    username?: string;
    display_name?: string;
    pfp_url?: string;
  } | null,
): SimpleUser | undefined => {
  if (!user) {
    return undefined;
  }

  const { fid, username, display_name, pfp_url } = user;

  return {
    fid,
    username,
    display_name,
    pfp_url,
  };
};

const InlineAvatarList: React.FC<{
  users: (SimpleUser | undefined)[];
  limit?: number;
}> = ({ users, limit = 6 }) => {
  const visibleUsers = useMemo(
    () => take(users.filter((user): user is SimpleUser => Boolean(user)), limit),
    [users, limit],
  );

  if (!visibleUsers.length) {
    return <p className="text-sm text-slate-500">No results found.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {visibleUsers.map((user, index) => (
        <div
          key={String(user.fid ?? user.username ?? user.display_name ?? index)}
          className="flex items-center gap-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.pfp_url ?? undefined} alt={user.display_name || user.username || ""} />
            <AvatarFallback>
              {(user.display_name || user.username || "?")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {user.display_name || user.username || `FID ${user.fid}`}
            </p>
            {user.username && (
              <p className="text-xs text-slate-500">@{user.username}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ChannelFidget: React.FC<FidgetArgs<ChannelFidgetSettings>> = ({
  settings: { channelId },
}) => {
  const { fid: viewerFid } = useFarcasterSigner("Channel");

  const { data: channelResponse, isLoading: channelLoading } = useChannelById(
    channelId,
    viewerFid > 0 ? viewerFid : undefined,
  );
  const { data: membersResponse, isLoading: membersLoading } = useChannelMembers(channelId, 6);
  const { data: followersResponse, isLoading: followersLoading } = useChannelFollowers(channelId, 6);
  const hasViewerFid = typeof viewerFid === "number" && viewerFid > 0;
  const { data: relevantFollowersResponse, isLoading: relevantFollowersLoading } =
    useChannelRelevantFollowers(channelId, hasViewerFid ? viewerFid : undefined);

  const isLoading =
    channelLoading ||
    membersLoading ||
    followersLoading ||
    (hasViewerFid ? relevantFollowersLoading : false);

  const channel = channelResponse?.channel;

  const description = channel?.description?.trim();
  const channelName = channel?.name || channel?.id;
  const avatarUrl = channel?.image_url;
  const followerUsers = useMemo(
    () =>
      (followersResponse?.users ?? [])
        .map((follower) => toSimpleUser(follower?.user))
        .filter((user): user is SimpleUser => Boolean(user)),
    [followersResponse?.users],
  );
  const memberUsers = useMemo(
    () =>
      (membersResponse?.members ?? [])
        .map((member) => toSimpleUser(member?.user))
        .filter((user): user is SimpleUser => Boolean(user)),
    [membersResponse?.members],
  );
  const followerCount = channel?.follower_count ?? followerUsers.length ?? 0;
  const memberCount = channel?.member_count ?? memberUsers.length ?? 0;

  const leadUser = channel?.lead || first(memberUsers);

  const relevantFollowerUsers = useMemo(
    () =>
      (relevantFollowersResponse?.top_relevant_followers_hydrated ?? [])
        .map((follower) => toSimpleUser(follower?.user))
        .filter((user): user is SimpleUser => Boolean(user)),
    [relevantFollowersResponse?.top_relevant_followers_hydrated],
  );

  if (!channelId) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        Provide a Farcaster channel ID to load channel details.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <SkeletonSection />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
        Unable to load channel information.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt={channelName ?? channel.id} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl text-slate-500">
                /
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {channelName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">/{channel.id}</p>
          </div>
        </div>
        {leadUser && (
          <div className="mt-2 flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 md:ml-auto md:mt-0">
            <span className="uppercase tracking-wide text-slate-500">Lead</span>
            <span>{leadUser.display_name || leadUser.username || `FID ${leadUser.fid}`}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {description}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionHeading title="Followers" count={followerCount} />
          <InlineAvatarList users={followerUsers} />
        </div>
        <div className="flex flex-col gap-3">
          <SectionHeading title="Members" count={memberCount} />
          <InlineAvatarList users={memberUsers} />
        </div>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-3",
          (!hasViewerFid || !relevantFollowerUsers.length) && "opacity-70",
        )}
      >
        <SectionHeading title="Relevant Followers" />
        {hasViewerFid ? (
          <InlineAvatarList users={relevantFollowerUsers} />
        ) : (
          <p className="text-sm text-slate-500">
            Sign in with Farcaster to see relevant followers for this channel.
          </p>
        )}
      </div>
    </div>
  );
};

export default {
  fidget: ChannelFidget,
  properties: channelProperties,
} as FidgetModule<FidgetArgs<ChannelFidgetSettings>>;
