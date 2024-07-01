import React, { useEffect, useState } from "react";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";
import { FeedResponse, FeedType } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastRow } from "./components/CastRow";
import { useFarcasterSigner } from ".";
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";
import { CastThreadView } from "./components/CastThreadView";
import FeedTypeSelector from "@/common/components/molecules/FeedTypeSelector";

export type feedFidgetSettings = {
  feedType: FeedType;
};

const feedProperties: FidgetProperties = {
  fidgetName: "feed",
  fields: [
    {
      fieldName: "feedType",
      inputSelector: FeedTypeSelector,
      required: false,
      default: FeedType.Following,
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
  icon: 0x1f4f0,
};

export const FEED_TYPES = [
  { name: "Following", value: FeedType.Following },
  { name: "Filter", value: FeedType.Filter },
];

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
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, _lastPageParam, _allPageParams) =>
      lastPage.next.cursor,
  });
};

const Feed: React.FC<FidgetArgs<feedFidgetSettings>> = ({
  settings: { feedType },
}) => {
  const { fid } = useFarcasterSigner("feed");
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isError } =
    useGetCasts(feedType, fid);

  const [showCastThreadView, setShowCastThreadView] = useState(false);
  const [selectedCastHash, setSelectedCastHash] = useState("");
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  const onSelectCast = (hash: string) => {
    setSelectedCastHash(hash);
    setShowCastThreadView(true);
  };

  const renderThread = () => (
    <CastThreadView
      cast={{
        hash: selectedCastHash,
        author: {
          fid: fid,
        },
      }}
      onBack={() => setShowCastThreadView(false)}
      setSelectedCastHash={setSelectedCastHash}
    />
  );

  const renderFeed = () => {
    return (
      <>
        <div>
          {isError ? (
            <div>{"Error"}</div>
          ) : (
            data?.pages.map((page, pageNum) => (
              <React.Fragment key={pageNum}>
                {page.casts.map((cast, index) => (
                  <CastRow
                    cast={cast}
                    key={index}
                    onSelect={() => onSelectCast(cast.hash)}
                  />
                ))}
              </React.Fragment>
            ))
          )}
        </div>

        <div ref={ref} className="h-3/6">
          {isFetchingNextPage ? (
            <div className="h-full w-full bg-[#E6E6E6] flex flex-col justify-center items-center">
              <Loading />
            </div>
          ) : hasNextPage ? (
            "Fetch More Data"
          ) : (
            <div className="h-full w-full flex flex-col justify-center items-center">
              <Loading />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="h-full overflow-y-scroll justify-center items-center">
      {showCastThreadView ? renderThread() : renderFeed()}
    </div>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<feedFidgetSettings>>;

export default exp;
