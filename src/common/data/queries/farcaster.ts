import {
  BulkUsersResponse,
  Conversation,
  FeedResponse,
  FeedType,
  FilterType,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axiosBackend from "../api/backend";
import { isUndefined } from "lodash";

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
}: {
  feedType: FeedType;
  fid: number;
  filterType: FilterType;
  fids?: string;
  channel?: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["channelCasts", feedType, fid, filterType, fids, channel],
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
      try {
        const url = `https://api.neynar.com/v2/farcaster/cast/search?q=${keyword}&priority_mode=false&limit=25&cursor=${cursor}`;
        const apiKey = process.env.NEYNAR_API_KEY;
        const { data } = await axiosBackend.get<FeedResponse>(url, {
          headers: {
            "x-api-key": apiKey,
          },
        });
        return data;
      } catch (error) {
        console.error("Error fetching casts by keyword:", error);
        throw error;
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, _lastPageParam, _allPageParams) =>
      !isUndefined(lastPage) && !isUndefined(lastPage.next)
        ? lastPage.next.cursor
        : undefined,
  });
};
