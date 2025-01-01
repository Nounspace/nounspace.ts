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
import {
  useGetCasts,
  useGetCastsByKeyword,
} from "@/common/data/queries/farcaster"; // Import new hook
import useLifoQueue from "@/common/lib/hooks/useLifoQueue";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import PlatformSelector from "@/common/components/molecules/PlatformSelector";
import { Platform } from "@/common/components/molecules/PlatformSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";

export enum FilterType {
  Channel = "channel_id",
  Users = "fids",
  Keyword = "keyword", // Add new filter type
}

export type FeedFidgetSettings = {
  feedType: FeedType;
  filterType: FilterType;
  users?: string; // this should be a number array, but that requires special inputs to build later
  channel?: string;
  keyword?: string; // Add keyword field
  selectPlatform: Platform;
  Xhandle: string;
  style: string;
} & FidgetSettingsStyle;

const FILTER_TYPES = [
  { name: "Channel", value: FilterType.Channel },
  { name: "Users", value: FilterType.Users },
  { name: "Keyword", value: FilterType.Keyword }, // Add new filter type
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

function XStyleSelector({
  onChange,
  value,
  className,
}: {
  onChange: (value: string) => void;
  value: string;
  className?: string;
}) {
  const styles = [
    { name: "Light", value: "light" },
    { name: "Dark", value: "dark" },
  ];

  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={styles}
      className={className}
    />
  );
}

const feedProperties: FidgetProperties<FeedFidgetSettings> = {
  fidgetName: "Feed",
  fields: [
    {
      fieldName: "selectPlatform",
      displayName: "Select App",
      inputSelector: PlatformSelector,
      required: false,
      default: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
    },
    {
      fieldName: "feedType",
      displayName: "Feed Type",
      inputSelector: FeedTypeSelector,
      required: false,
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app",
      default: FeedType.Following,
    },
    {
      fieldName: "Xhandle",
      displayName: "Username",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) => settings?.selectPlatform?.name === "Farcaster",
      default: "thenounspace",
    },
    {
      fieldName: "filterType",
      displayName: "Filter Type",
      inputSelector: FilterTypeSelector,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings?.selectPlatform?.name === "The other app",
      default: FilterType.Users,
    },
    {
      fieldName: "users",
      displayName: "FID",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Users ||
        settings?.selectPlatform?.name === "The other app",
      default: "",
    },
    {
      fieldName: "channel",
      displayName: "Channel",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Channel ||
        settings.selectPlatform?.name === "The other app",
      default: "",
    },
    {
      fieldName: "keyword",
      displayName: "Keyword",
      inputSelector: TextInput,
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Keyword ||
        settings?.selectPlatform?.name === "The other app",
      default: "",
    },
    {
      fieldName: "style",
      displayName: "Feed Style",
      inputSelector: XStyleSelector,
      required: false,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name !== "The other app",
      default: "light",
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "background",
      default: "var(--user-theme-fidget-background)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app",
    },
    {
      fieldName: "fidgetBorderWidth",
      default: "var(--user-theme-fidget-border-width)",
      required: false,
      inputSelector: BorderSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app",
    },
    {
      fieldName: "fidgetBorderColor",
      default: "var(--user-theme-fidget-border-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app",
    },
    {
      fieldName: "fidgetShadow",
      default: "var(--user-theme-fidget-shadow)",
      required: false,
      inputSelector: ShadowSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app",
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

const Feed: React.FC<FidgetArgs<FeedFidgetSettings>> = ({ settings }) => {
  const {
    selectPlatform = { name: "Farcaster", icon: "/images/farcaster.jpeg" },
    Xhandle,
    style,
  } = settings;
  const { feedType, users, channel, filterType, keyword } = settings;
  const { fid } = useFarcasterSigner("feed");

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isPending,
  } =
    filterType === FilterType.Keyword
      ? useGetCastsByKeyword({ keyword: keyword || "" })
      : useGetCasts({
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

  const renderXFeed = () => {
    const theme = style || "light";
    const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${Xhandle}?dnt=true&embedId=twitter-widget-0&frame=false&hideBorder=true&hideFooter=false&hideHeader=false&hideScrollBar=true&lang=en&origin=https%3A%2F%2Fpublish.twitter.com%2F%23&theme=${theme}&widgetsVersion=2615f7e52b7e0%3A1702314776716`;

    return (
      <iframe
        src={url}
        style={{ border: "none", width: "100%", height: "100%" }}
        title="Twitter Feed"
        scrolling="no"
        frameBorder="0"
      />
    );
  };

  const renderFeedContent = () => {
    if (selectPlatform.name === "The other app") {
      return renderXFeed();
    }
    return renderFeed();
  };

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
                  {filterType === FilterType.Keyword
                    ? // @ts-expect-error
                      page.result.casts?.map(
                        (
                          cast,
                          index, // Ensure casts array is accessed correctly for keyword filter
                        ) => (
                          <CastRow
                            cast={cast}
                            key={index}
                            onSelect={onSelectCast}
                          />
                        ),
                      )
                    : page.casts?.map(
                        (
                          cast,
                          index, // Ensure casts array is accessed correctly for other filters
                        ) => (
                          <CastRow
                            cast={cast}
                            key={index}
                            onSelect={onSelectCast}
                          />
                        ),
                      )}
                </React.Fragment>
              ))
            ) : (
              <div>No casts found with these filter settings</div>
            )}
          </div>
        )}
        {!isError && (
          <div
            ref={ref}
            className="h-3/6"
            style={{
              fontFamily: settings.fontFamily,
              color: settings.fontColor,
            }}
          >
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

  return (
    <div
      className="h-full"
      style={{
        fontFamily: settings.fontFamily,
        color: settings.fontColor,
      }}
    >
      {isThreadView && (
        <div className="h-full overflow-y-scroll justify-center items-center">
          {renderThread()}
        </div>
      )}
      <div className="h-full overflow-y-scroll justify-center items-center">
        {renderFeedContent()}
      </div>
    </div>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<FeedFidgetSettings>>;

export default exp;
