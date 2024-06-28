import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";
import {
  FeedResponse,
  FeedType,
  NextCursor,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { ScrollArea } from "@/common/components/atoms/scroll-area";
import { map } from "lodash";
import { CastRow } from "./components/CastRow";
import { useFarcasterSigner } from ".";

export type feedFidgetSettings = {
  feedType: FeedType;
};

const feedProperties: FidgetProperties = {
  fidgetName: "feed",
  fields: [
    {
      // TO DO: Change this to a drop down menu
      // We probably want to make a function that you can pass
      // drop down menu options to that returns a component that allows
      // selecting one of those options
      fieldName: "feedType",
      inputSelector: TextInput,
      required: false,
      default: FeedType.Following,
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
  icon: 0x1f310, // 🌐
};

export const useGetCasts = (feedType: FeedType, fid: number) => {
  return useInfiniteQuery({
    queryKey: ["channelCasts", feedType, fid],
    staleTime: 1000 * 60 * 1,
    queryFn: async ({ pageParam: cursor }) => {
      const { data } = await axiosBackend.get<FeedResponse>(
        "/api/farcaster/neynar/feed",
        {
          params: {
            fid,
            feedType,
            cursor,
          },
        },
      );

      return data;
    },
    initialPageParam: undefined as NextCursor | undefined,
    getNextPageParam: (lastPage, _allPages, _lastPageParam, _allPageParams) =>
      lastPage.next,
  });
};

const Feed: React.FC<FidgetArgs<feedFidgetSettings>> = ({
  settings: { feedType },
}) => {
  const { fid } = useFarcasterSigner("feed");
  const { fetchNextPage, hasNextPage, data, isLoading, error, isFetching } =
    useGetCasts(feedType, fid);

  // TO DO: trigger new page loading as inifite scroll
  // TO DO: Handle respons errors
  // TO DO: show loading at end of inifinite scroll
  // Helpful links
  // https://tanstack.com/query/latest/docs/framework/react/reference/useInfiniteQuery
  // https://www.radix-ui.com/primitives/docs/components/scroll-area

  return (
    <div>
      {isLoading ? (
        "LOADING..."
      ) : (
        <ScrollArea>
          {map(data?.pages, (page) => {
            return map(page.casts, (cast) => {
              return <CastRow cast={cast} />;
            });
          })}
        </ScrollArea>
      )}
    </div>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<feedFidgetSettings>>;

export default exp;
