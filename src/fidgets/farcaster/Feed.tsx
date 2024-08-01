import React, { useEffect, useCallback } from "react";
import { isNil } from "lodash";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { FeedType } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastRow } from "./components/CastRow";
import { useFarcasterSigner } from ".";
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";
import { CastThreadView } from "./components/CastThreadView";
import FeedTypeSelector from "@/common/components/molecules/FeedTypeSelector";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import TextInput from "@/common/components/molecules/TextInput";
import { useGetCasts } from "@/common/data/queries/farcaster";
import { defaultStyleFields } from "@/fidgets/helpers";
import useLifoQueue from "@/common/lib/hooks/useLifoQueue";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

enum FilterType {
  Channel = "channel_id",
  Users = "fids",
}

export type FeedFidgetSettings = {
  feedType: FeedType;
  filterType: FilterType;
  users: string; // this should be a number array, but that requires special inputs to build later
  channel: string;
} & FidgetSettingsStyle;

const FILTER_TYPES = [
  { name: "Channel", value: FilterType.Channel },
  { name: "Users", value: FilterType.Users },
];

export const FilterTypeSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={FILTER_TYPES}
      className={className}
    />
  );
};

const feedProperties: FidgetProperties<FeedFidgetSettings> = {
  fidgetName: "feed",
  fields: [
    {
      fieldName: "feedType",
      displayName: "Feed Type",
      inputSelector: FeedTypeSelector,
      required: false,
      default: FeedType.Following,
    },
    {
      fieldName: "filterType",
      displayName: "Filter Type",
      inputSelector: FilterTypeSelector,
      required: false,
      disabledIf: (settings) => settings.feedType !== FeedType.Filter,
      default: FilterType.Users,
    },
    {
      fieldName: "users",
      displayName: "Users",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Users,
      default: "",
    },
    {
      fieldName: "channel",
      displayName: "Channel",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Channel,
      default: "",
    },
    ...defaultStyleFields,
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

const Feed: React.FC<FidgetArgs<FeedFidgetSettings>> = ({ settings }) => {
  const { feedType, users, channel, filterType } = settings;
  const { fid } = useFarcasterSigner("feed");
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isPending,
  } = useGetCasts({
    feedType,
    fid,
    filterType,
    fids: users,
    channel,
  });

  const threadStack = useLifoQueue<string>();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    threadStack.clear();
  }, [settings]);

  const onSelectCast = useCallback((hash: string) => {
    threadStack.push(hash);
  }, []);

  const renderThread = () => (
    <CastThreadView
      cast={{
        hash: threadStack.last || "",
        author: {
          fid: fid,
        },
      }}
      onBack={threadStack.pop}
      onSelect={onSelectCast}
    />
  );

  const renderFeed = () => {
    return (
      <>
        {!isPending && (
          <div>
            {isError ? (
              <div>Error</div>
            ) : !isNil(data) ? (
              data.pages.map((page, pageNum) => (
                <React.Fragment key={pageNum}>
                  {page.casts.map((cast, index) => (
                    <CastRow cast={cast} key={index} onSelect={onSelectCast} />
                  ))}
                </React.Fragment>
              ))
            ) : (
              <div>No casts found with these filter settings</div>
            )}
          </div>
        )}
        {!isError && (
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
        )}
      </>
    );
  };

  const isThreadView = threadStack.last !== undefined;

  // Note: feed is mounted in its own scroll container to maintain its scroll position when
  // returning from a thread.
  return (
    <>
      {isThreadView && (
        <div className="h-full overflow-y-scroll justify-center items-center">
          {renderThread()}
        </div>
      )}
      <div
        className={mergeClasses(
          "h-full overflow-y-scroll justify-center items-center",
          isThreadView ? "invisible" : "visible",
        )}
      >
        {renderFeed()}
      </div>
    </>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<FeedFidgetSettings>>;

export default exp;
