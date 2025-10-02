import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import TextInput from "@/common/components/molecules/TextInput";
import { useChannelById, useChannelFollowers, useChannelMembers } from "@/common/data/queries/farcaster";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { defaultStyleFields } from "@/fidgets/helpers";
import { first } from "lodash";
import Link from "next/link";
import React from "react";

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

type NeynarUser = {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
};

type SimpleUser = NeynarUser;

type SimpleUserSource =
  | NeynarUser
  | { user?: NeynarUser | null }
  | null
  | undefined;

const hasNestedUser = (
  value: SimpleUserSource,
): value is { user?: NeynarUser | null | undefined } => {
  return typeof value === "object" && value !== null && "user" in value;
};

const isNeynarUser = (value: SimpleUserSource): value is NeynarUser => {
  return typeof value === "object" && value !== null && !("user" in value);
};

const toSimpleUser = (user?: SimpleUserSource): SimpleUser | undefined => {
  if (!user) {
    return undefined;
  }

  if (hasNestedUser(user)) {
    return toSimpleUser(user.user ?? undefined);
  }

  if (!isNeynarUser(user)) {
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

  const isLoading = channelLoading || membersLoading || followersLoading;

  const channel = channelResponse?.channel;

  const description = channel?.description?.trim();
  const channelName = channel?.name || channel?.id;
  const avatarUrl = channel?.image_url;
  const followerCount = channel?.follower_count ?? followersResponse?.users?.length ?? 0;
  const memberCount = channel?.member_count ?? membersResponse?.members?.length ?? 0;

  const ownerUser =
    toSimpleUser(channel?.lead) ||
    toSimpleUser(first(membersResponse?.members)?.user ?? undefined);
  const externalLink = channel?.external_link;

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
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
            {ownerUser && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="uppercase tracking-wide text-slate-500">Owner</span>
                {ownerUser.username ? (
                  <Link
                    href={`/s/${ownerUser.username}`}
                    className="flex items-center gap-2 text-slate-700 transition hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={ownerUser.pfp_url ?? undefined}
                        alt={ownerUser.display_name || ownerUser.username || ""}
                      />
                      <AvatarFallback>
                        {(ownerUser.display_name || ownerUser.username || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{ownerUser.display_name || ownerUser.username || `FID ${ownerUser.fid}`}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ownerUser.pfp_url ?? undefined} alt={ownerUser.display_name || ""} />
                      <AvatarFallback>
                        {(ownerUser.display_name || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{ownerUser.display_name || `FID ${ownerUser.fid}`}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Followers
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {followerCount.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Members
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {memberCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      {(description || externalLink?.url) && (
        <div className="space-y-3">
          {description && (
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {description}
            </p>
          )}
          {externalLink?.url && (
            <a
              href={externalLink.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <span>{externalLink.title || "External Link"}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  fidget: ChannelFidget,
  properties: channelProperties,
} as FidgetModule<FidgetArgs<ChannelFidgetSettings>>;
