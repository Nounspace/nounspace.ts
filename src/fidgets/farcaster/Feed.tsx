import React, { useEffect, useState } from "react";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
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

enum FilterType {
  Channel = "channel_id",
  Users = "fids",
}

export type FeedFidgetSettings = {
  feedType: FeedType;
  filterType: FilterType;
  users: string; // this should be a number array, but that requires special inputs to build later
  channel: string;
};

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

const Feed: React.FC<FidgetArgs<FeedFidgetSettings>> = ({
  settings: { feedType, users, channel, filterType },
}) => {
  const { fid } = useFarcasterSigner("feed");
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isError } =
    useGetCasts({
      feedType,
      fid,
      filterType,
      fids: users,
      channel,
    });

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
} as FidgetModule<FidgetArgs<FeedFidgetSettings>>;

export default exp;
