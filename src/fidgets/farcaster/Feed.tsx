import BorderSelector from "@/common/components/molecules/BorderSelector";
import FeedTypeSelector from "@/common/components/molecules/FeedTypeSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import Loading from "@/common/components/molecules/Loading";
import PlatformSelector, { Platform } from "@/common/components/molecules/PlatformSelector";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import ThemeSelector from "@/common/components/molecules/ThemeSelector";
import {
  useGetCasts,
  useGetCastsByKeyword,
} from "@/common/data/queries/farcaster";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import useLifoQueue from "@/common/lib/hooks/useLifoQueue";
import { BsChatRightHeart, BsChatRightHeartFill } from "react-icons/bs";
import { mobileStyleSettings } from "../helpers";
import { FeedType } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { isNil } from "lodash";
import React, { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useFarcasterSigner } from ".";
import { CastRow } from "./components/CastRow";
import { CastThreadView } from "./components/CastThreadView";
import { BsChatRightHeart, BsChatRightHeartFill } from "react-icons/bs";

export enum FilterType {
  Channel = "channel_id",
  Users = "fids",
  Keyword = "keyword", 
}

export type FeedFidgetSettings = {
  feedType: FeedType;
  filterType: FilterType;
  users?: string; 
  channel?: string;
  keyword?: string; 
  selectPlatform: Platform;
  Xhandle: string;
  style: string;
  useDefaultColors?: boolean; 
} & FidgetSettingsStyle;

const FILTER_TYPES = [
  { name: "Channel", value: FilterType.Channel },
  { name: "Users", value: FilterType.Users },
  { name: "Keyword", value: FilterType.Keyword },
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
  fidgetName: "Feed",
  fields: [
    ...mobileStyleSettings,
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
      inputSelector: ThemeSelector,
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
      displayName: "Font Color",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-font-color)"
          defaultColor="#000000"
          colorType="font color"
        />
      ),
      group: "style",
      default: "var(--user-theme-font-color)",
    },
    {
      fieldName: "background",
      displayName: "Background",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-background)"
          defaultColor="#FFFFFF"
          colorType="background"
        />
      ),
      group: "style",
      default: "var(--user-theme-fidget-background)",
      disabledIf: (settings) => settings?.selectPlatform?.name === "The other app",
    },
    {
      fieldName: "fidgetBorderWidth",
      default: "var(--user-theme-fidget-border-width)",
      required: false,
      inputSelector: BorderSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app" || settings?.useDefaultColors === true,
    },
    {
      fieldName: "fidgetBorderColor",
      displayName: "Border Color",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      ),
      group: "style",
      default: "var(--user-theme-fidget-border-color)",
      disabledIf: (settings) => settings?.selectPlatform?.name === "The other app",
    },
    {
      fieldName: "fidgetShadow",
      default: "var(--user-theme-fidget-shadow)",
      required: false,
      inputSelector: ShadowSelector,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "The other app" || settings?.useDefaultColors === true,
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
  icon: 0x1f4f0,
  mobileIcon: <BsChatRightHeart size={20} />,
  mobileIconSelected: <BsChatRightHeartFill size={20} />,
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
                    ? page.result.casts?.map(
                      (
                        cast,
                        index, 
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
                        index, 
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
        fontFamily: settings.useDefaultColors ? 'var(--user-theme-font)' : settings.fontFamily,
        color: settings.useDefaultColors ? 'var(--user-theme-font-color)' : settings.fontColor,
        background: settings.useDefaultColors ? 'var(--user-theme-fidget-background)' : settings.background,
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
