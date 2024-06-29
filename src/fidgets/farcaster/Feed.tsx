import React, { useEffect, useRef, useState } from "react";
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
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";

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
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
  } = useGetCasts(feedType, fid);

  // TO DO: trigger new page loading as inifite scroll
  // TO DO: Handle respons errors
  // TO DO: show loading at end of inifinite scroll
  // Helpful links
  // https://tanstack.com/query/latest/docs/framework/react/reference/useInfiniteQuery
  // https://www.radix-ui.com/primitives/docs/components/scroll-area

  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="h-full overflow-scroll justify-center items-center">
      <div>
        {/* data.pages: Page[] */}
        {isError ? (
          <div>{"Error"}</div>
        ) : (
          data?.pages.map((page, pageNum) => (
            <React.Fragment key={pageNum}>
              {page.casts.map((cast, index) => (
                <CastRow cast={cast} key={index} />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
      {/* Pagination Controls */}
      <div ref={ref} className="bg-[#E6E6E6]">
        {isFetchingNextPage ? (
          <div className="bg-[#E6E6E6] h-3/6 w-full flex flex-col justify-center items-center">
            <Loading />
          </div>
        ) : hasNextPage ? (
          "Fetch More Data"
        ) : (
          <div className="bg-[#E6E6E6] h-full w-full flex flex-col justify-center items-center">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<feedFidgetSettings>>;

export default exp;
