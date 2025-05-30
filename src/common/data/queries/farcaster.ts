import {
  BulkUsersResponse,
  Conversation,
  FeedResponse,
  FeedType,
  FilterType,
} from "@neynar/nodejs-sdk/build/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isUndefined } from "lodash";
import axiosBackend from "../api/backend";

export const useLoadFarcasterUser = (fid: number, viewerFid?: number) => {
  return useQuery({
    queryKey: ["user", fid, viewerFid],
    staleTime: 1000 * 60 * 1,
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
    staleTime: 1000 * 60 * 1,
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
    staleTime: 1000 * 60 * 1,
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
    staleTime: 1000 * 60 * 1,
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
