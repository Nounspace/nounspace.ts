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
  useFidFromUsername,
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
import { FeedType } from "@neynar/nodejs-sdk/build/api";
import { isNil } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { BsChatRightHeart, BsChatRightHeartFill } from "react-icons/bs";
import { useInView } from "react-intersection-observer";
import { useFarcasterSigner } from ".";
import { mobileStyleSettings, WithMargin } from "../helpers";
import { CastRow } from "./components/CastRow";
import { CastThreadView } from "./components/CastThreadView";

export enum FilterType {
  Channel = "channel_id",
  Users = "fids",
  Keyword = "keyword",
}

export type FeedFidgetSettings = {
  feedType: FeedType;
  filterType: FilterType;
  users?: string;
  username?: string;
  channel?: string;
  keyword?: string;
  selectPlatform: Platform;
  Xhandle: string;
  style: string;
  useDefaultColors?: boolean;
  membersOnly?: boolean;
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
      displayName: "Network",
      inputSelector: (props) => (
        <WithMargin>
          <PlatformSelector {...props} />
        </WithMargin>
      ),
      required: false,
      default: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
      group: "settings",
    },
    {
      fieldName: "feedType",
      displayName: "Feed Type",
      displayNameHint: "Select Following for a personalized feed or Filter by User, Channel, or Keyword.",
      inputSelector: (props) => (
        <WithMargin>
          <FeedTypeSelector {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "X",
      default: FeedType.Following,
      group: "settings",
    },
    {
      fieldName: "Xhandle",
      displayName: "Username",
      displayNameHint: "Input an X username to display a feed of their Tweets. Do not include the '@'",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) => settings?.selectPlatform?.name === "Farcaster",
      default: "thenounspace",
      group: "settings",
    },
    {
      fieldName: "filterType",
      displayName: "Filter Type",
      displayNameHint: "Choose between Users, Channel, or Keyword to filter the feed.",
      inputSelector: (props) => (
        <WithMargin>
          <FilterTypeSelector {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings?.selectPlatform?.name === "X",
      default: FilterType.Users,
      group: "settings",
    },
    {
      fieldName: "username",
      displayName: "Username",
      displayNameHint: "Input a Farcaster username to display a feed of that user's casts.",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Users ||
        settings?.selectPlatform?.name === "X",
      default: "",
      group: "settings",
    },
    {
      fieldName: "users",
      displayName: "FID",
      displayNameHint: "Input an FID to display a feed of that user's casts.",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Users ||
        settings?.selectPlatform?.name === "X" ||
        !!(settings.username && settings.username.length > 0),
      default: "",
      group: "settings",
    },
    {
      fieldName: "channel",
      displayName: "Channel",
      displayNameHint: "Input a Farcaster channel name to display casts from that channel.",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Channel ||
        settings.selectPlatform?.name === "X",
      default: "",
      group: "settings",
    },
    {
      fieldName: "keyword",
      displayName: "Keyword",
      displayNameHint: "Input a keyword to filter casts containing this term.",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      required: false,
      disabledIf: (settings) =>
        settings.feedType !== FeedType.Filter ||
        settings.filterType !== FilterType.Keyword ||
        settings?.selectPlatform?.name === "X",
      default: "",
      group: "settings",
    },
    {
      fieldName: "style",
      displayName: "Feed Style",
      inputSelector: (props) => (
        <WithMargin>
          <ThemeSelector {...props} />
        </WithMargin>
      ),
      required: false,
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name !== "X",
      default: "light",
    },
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint: "Font used for the body text. Set to Theme Font to inherit the Body Font from the Theme.",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "fontColor",
      displayName: "Font Color",
      displayNameHint: "Color used for the body text. Click the paintbrush to inherit the Font Color from the Theme.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-font-color)"
            defaultColor="#000000"
            colorType="font color"
          />
        </WithMargin>
      ),
      group: "style",
      default: "var(--user-theme-font-color)",
    },
    {
      fieldName: "background",
      displayName: "Background",
      displayNameHint: "Color used for the background of the Fidget. Click the paintbrush to inherit the Fidget Background Color from the theme.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-fidget-background)"
            defaultColor="#FFFFFF"
            colorType="background"
          />
        </WithMargin>
      ),
      group: "style",
      default: "var(--user-theme-fidget-background)",
      disabledIf: (settings) => settings?.selectPlatform?.name === "X",
    },
    {
      fieldName: "fidgetBorderWidth",
      displayName: "Fidget Border Width",
      displayNameHint: "Width of the Fidget's border. Set to Theme Border to inherit the Fidget Border Width from the Theme. Set to None to remove the border.",
      default: "var(--user-theme-fidget-border-width)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <BorderSelector {...props} />
        </WithMargin>
      ),
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "X" || settings?.useDefaultColors === true,
    },
    {
      fieldName: "fidgetBorderColor",
      displayName: "Border Color",
      displayNameHint: "Color of the Fidget's Border.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-fidget-border-color)"
            defaultColor="#000000"
            colorType="border color"
          />
        </WithMargin>
      ),
      group: "style",
      default: "var(--user-theme-fidget-border-color)",
      disabledIf: (settings) => settings?.selectPlatform?.name === "X",
    },
    {
      fieldName: "fidgetShadow",
      displayName: "Fidget Shadow",
      displayNameHint: "Shadow for the Fidget. Set to Theme Shadow to inherit the Fidget Shadow Settings from the Theme. Set to None to remove the shadow.",
      default: "var(--user-theme-fidget-shadow)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ShadowSelector {...props} />
        </WithMargin>
      ),
      group: "style",
      disabledIf: (settings) =>
        settings?.selectPlatform?.name === "X" || settings?.useDefaultColors === true,
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
  { name: "For you", value: "for_you" }, 
  { name: "Trending", value: "trending" }, 
  { name: "Filter", value: FeedType.Filter },
];

const Feed: React.FC<FidgetArgs<FeedFidgetSettings>> = ({ settings }) => {
  const {
    selectPlatform = { name: "Farcaster", icon: "/images/farcaster.jpeg" },
    Xhandle,
    style,
  } = settings;
  const { feedType, users, username, channel, filterType, keyword, membersOnly } = settings;
  const { fid } = useFarcasterSigner("feed");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevFeedType, setPrevFeedType] = useState(feedType);

  const { data: usernameFid } = useFidFromUsername(
    filterType === FilterType.Users && username ? username : undefined
  );

  const effectiveFids = filterType === FilterType.Users && usernameFid
    ? usernameFid.toString()
    : users;

  const extraQueryParams =
    feedType === FeedType.Filter &&
    filterType === FilterType.Channel &&
    membersOnly !== undefined
      ? { membersOnly }
      : {};

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isPending,
    refetch,
  } =
    filterType === FilterType.Keyword
      ? useGetCastsByKeyword({ keyword: keyword || "" })
      : useGetCasts({
          feedType,
          fid,
          filterType,
          fids: effectiveFids,
          channel,
          ...extraQueryParams,
        });

  const threadStackRef = React.useRef(useLifoQueue<string>());
  const threadStack = threadStackRef.current;

  const [ref, inView] = useInView();

  useEffect(() => {
    if (prevFeedType !== feedType) {
      setIsTransitioning(true);
      threadStack.clear();
      setTimeout(() => {
        refetch().then(() => {
          setIsTransitioning(false);
          setPrevFeedType(feedType);
        }).catch(() => {
          setIsTransitioning(false);
          setPrevFeedType(feedType);
        });
      }, 200);
    }
  }, [feedType, prevFeedType, refetch]);

  useEffect(() => {
    if (inView && hasNextPage && !isTransitioning) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isTransitioning]);


  useEffect(() => {
    threadStack.clear();
  }, [settings, threadStack]);

  const onSelectCast = useCallback((hash: string) => {
    threadStack.push(hash);
  }, [threadStack]);

  const renderThread = () => (
    <CastThreadView
      cast={{
        hash: threadStack.last || "",
        author: { fid },
      }}
      onBack={threadStack.pop}
      onSelect={onSelectCast}
    />
  );

  const renderXFeed = () => {
    const theme = style || "light";

    const params = new URLSearchParams({
      dnt: "true",
      embedId: "twitter-widget-0",
      frame: "false",
      hideBorder: "true",
      hideFooter: "false",
      hideHeader: "false",
      hideScrollBar: "false",
      lang: "en",
      origin: "https://publish.twitter.com/#",
      theme,
      widgetsVersion: "2615f7e52b7e0:1702314776716",
    });

    const url =
      "https://syndication.twitter.com/srv/timeline-profile/screen-name/" +
      `${Xhandle}?${params.toString()}`;

    const iframeStyle: React.CSSProperties = {
      border: "none",
      width: "100%",
      height: "100%",
      overflowY: "auto",
      overflowX: "auto",
    };
        style={iframeStyle}
      <iframe
        src={url}
        style={{ border: "none", width: "100%", height: "100%" }}
        title="Twitter Feed"
        scrolling="yes"
        frameBorder="0"
      />
    );
  };

  const renderFeedContent = () => {
    if (selectPlatform.name === "X") {
      return renderXFeed();
    }
    return renderFeed();
  };

  const renderFeed = () => {
    if (isTransitioning || isPending) {
      return (
        <div className="h-full w-full flex justify-center items-center">
          <Loading />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="h-full w-full flex justify-center items-center">
          <Loading />
        </div>
      );
    }

    const hasData = data && (
      filterType === FilterType.Keyword
        ? data.pages.some(page => page.result.casts?.length > 0)
        : data.pages.some(page => page.casts?.length > 0)
    );

    const filtroInformado = (
      (filterType === FilterType.Users && (effectiveFids || username)) ||
      (filterType === FilterType.Channel && channel) ||
      (filterType === FilterType.Keyword && keyword)
    );

    if (!hasData) {
      if (!filtroInformado) {
        return (
          <div className="h-full w-full flex justify-center items-center">
            <Loading />
          </div>
        );
      }
      return (
        <div className="p-4 text-center">
          <p>No content found with these filter settings</p>
        </div>
      );
    }
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
            ) : null}
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
      {isTransitioning ? (
        <div className="h-full w-full flex justify-center items-center">
          <Loading />
        </div>
      ) : isThreadView ? (
        <div className="h-full overflow-y-auto">
          {renderThread()}
        </div>
      ) : (
        <div className="h-full overflow-y-auto">
          {renderFeedContent()}
        </div>
      )}
    </div>
  );
};

const exp = {
  fidget: Feed,
  properties: feedProperties,
} as FidgetModule<FidgetArgs<FeedFidgetSettings>>;

export default exp;
