import {
  BulkUsersResponse,
  ChannelMemberListResponse,
  ChannelResponse,
  Conversation,
  FeedResponse,
  FeedType,
  FilterType,
  FollowersResponse,
  RelevantFollowersResponse,
} from "@neynar/nodejs-sdk/build/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isUndefined } from "lodash";
import axiosBackend from "../api/backend";

export const useLoadFarcasterUser = (fid: number, viewerFid?: number) => {
  return useQuery({
    queryKey: ["user", fid, viewerFid],
    // We increased staleTime to avoid unnecessary requests
    staleTime: 1000 * 60 * 5, 
    // Avoid reloading data when the window is focused
    refetchOnWindowFocus: false,
   // Limit retry attempts to avoid excessive calls
    retry: 1,
    queryFn: async () => {
      if (fid === -1) {
        return {
          users: [],
        };
      }
      const { data } = await axiosBackend.get<BulkUsersResponse>(
        "/api/farcaster/neynar/users",
        {
          params: {
            fids: fid,
            viewer_fid: viewerFid,
          },
        },
      );
      return data;
    },
  });
};

export const useLoadFarcasterConversation = (
  castHash: string,
  viewerFid?: number,
) => {
  return useQuery({
    queryKey: ["conversation", castHash, viewerFid],
    // We increased the staleTime for conversations, which normally don't change frequently
    staleTime: 1000 * 60 * 3, 
    // Avoid reloading data when the window is focused
    refetchOnWindowFocus: false,
 // Limit retry attempts to avoid excessive calls
    retry: 1,
    queryFn: async () => {
      const { data } = await axiosBackend.get<Conversation>(
        "/api/farcaster/neynar/conversation",
        {
          params: {
            identifier: castHash,
            type: "hash",
            replyDepth: 1,
            includeChronologicalParentCasts: true,
            viewer_fid: viewerFid,
            limit: 50,
            cursor: null,
          },
        },
      );

      return data;
    },
  });
};

export const useGetCasts = ({
  feedType,
  fid,
  filterType,
  fids,
  channel,
  membersOnly,
}: {
  feedType: FeedType;
  fid: number;
  filterType: FilterType;
  fids?: string;
  channel?: string;
  membersOnly?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ["channelCasts", feedType, fid, filterType, fids, channel, membersOnly],
    staleTime: 1000 * 60 * 3, // Increased to 3 minutes to reduce calls
    refetchInterval: 1000 * 60 * 10, // Refetch data every 10 minutes
    refetchOnWindowFocus: false, // Avoid automatic refetch when focusing on the window
    retry: 1, // Reduce the number of attempts in case of failure
    queryFn: async ({ pageParam: cursor }) => {
      const params: any = {
        fid: fid === -1 ? 456830 : fid,
        viewer_fid: fid === -1 ? 456830 : fid,
        feedType,
        cursor,
        channel_id: channel,
        fids,
        filter_type: filterType,
        ...(membersOnly !== undefined ? { membersOnly } : {}),
      };
      const { data } = await axiosBackend.get<FeedResponse>(
        "/api/farcaster/neynar/feed",
        { params },
      );
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, _lastPageParam, _allPageParams) =>
      !isUndefined(lastPage) && !isUndefined(lastPage.next)
        ? lastPage.next.cursor
        : undefined,
  });
};

export const useGetCastsByKeyword = ({ keyword }: { keyword: string }) => {
  return useInfiniteQuery({
    queryKey: ["keywordCasts", keyword],
    staleTime: 1000 * 60 * 3, // Increased to 3 minutes
    refetchInterval: 1000 * 60 * 10, // Automatic refetch every 10 minutes
    refetchOnWindowFocus: false, // Avoid refetch when focusing on the window
    enabled: keyword.length > 0, // Only search if there is a keyword
    retry: 1, // Limit attempts in case of failure
    queryFn: async ({ pageParam: cursor }) => {
      const params: any = {
        q: keyword,
        priority_mode: false,
        limit: 25,
        cursor,
      };
      const { data } = await axiosBackend.get(
        "/api/farcaster/neynar/searchByKeyword",
        { params: { ...params, keyword } },
      );
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.next?.cursor ?? undefined,
  });
};

export const useFidFromUsername = (username?: string) => {
  return useQuery({
    queryKey: ["fid-from-username", username],
    enabled: !!username && username.length > 0,
    queryFn: async () => {
      if (!username) return undefined;
      const res = await axios.get(
        `/api/farcaster/neynar/getFids?usernames=${encodeURIComponent(username)}`,
      );
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0].fid;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useFidFromAddress = (address?: string) => {
  return useQuery({
    queryKey: ["fid-from-address", address],
    enabled: !!address && address.length > 0,
    queryFn: async () => {
      if (!address) return undefined;
      const res = await axios.get(
        "/api/search/users",
        { params: { q: address, limit: 1 } },
      );
      const users = res.data?.value?.users;
      if (Array.isArray(users) && users.length > 0) {
        return Number(users[0].fid);
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useChannelById = (channelId: string, viewerFid?: number) => {
  return useQuery({
    queryKey: ["channel", channelId, viewerFid],
    enabled: !!channelId,
    staleTime: 1000 * 60 * 3,
    queryFn: async () => {
      const params: Record<string, number | string> = { id: channelId };
      if (typeof viewerFid === "number") {
        params.viewer_fid = viewerFid;
      }

      const { data } = await axiosBackend.get<ChannelResponse>(
        "/api/farcaster/neynar/channel",
        {
          params,
        },
      );

      return data;
    },
  });
};

export const useChannelMembers = (channelId: string, limit = 10) => {
  return useQuery({
    queryKey: ["channel-members", channelId, limit],
    enabled: !!channelId,
    staleTime: 1000 * 60 * 3,
    queryFn: async () => {
      const params: Record<string, number | string> = {
        channel_id: channelId,
      };

      if (typeof limit === "number") {
        params.limit = limit;
      }

      const { data } = await axiosBackend.get<ChannelMemberListResponse>(
        "/api/farcaster/neynar/channel/members",
        {
          params,
        },
      );

      return data;
    },
  });
};

export const useChannelFollowers = (channelId: string, limit = 10) => {
  return useQuery({
    queryKey: ["channel-followers", channelId, limit],
    enabled: !!channelId,
    staleTime: 1000 * 60 * 3,
    queryFn: async () => {
      const params: Record<string, number | string> = {
        id: channelId,
      };

      if (typeof limit === "number") {
        params.limit = limit;
      }

      const { data } = await axiosBackend.get<FollowersResponse>(
        "/api/farcaster/neynar/channel/followers",
        {
          params,
        },
      );

      return data;
    },
  });
};

export const useChannelRelevantFollowers = (
  channelId: string,
  viewerFid?: number,
) => {
  return useQuery({
    queryKey: ["channel-relevant-followers", channelId, viewerFid],
    enabled: !!channelId && typeof viewerFid === "number",
    staleTime: 1000 * 60 * 3,
    queryFn: async () => {
      const params: Record<string, number | string> = {
        id: channelId,
        viewer_fid: viewerFid!,
      };

      const { data } = await axiosBackend.get<RelevantFollowersResponse>(
        "/api/farcaster/neynar/channel/relevant-followers",
        {
          params,
        },
      );

      return data;
    },
  });
};
