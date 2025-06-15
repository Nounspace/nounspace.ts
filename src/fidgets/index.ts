// TO DO: Figure out how to do this importing dynamically
import Example from "./example";
import Frame from "./farcaster/Frame";
import Gallery from "./ui/gallery";
import TextFidget from "./ui/Text";
import IFrame from "./ui/IFrame";
import Profile from "./ui/profile";
import Channel from "./ui/channel";
import Grid from "./layout/Grid";
import NounishGovernance from "./community/nouns-dao/NounishGovernance";
import Cast from "./farcaster/Cast";
import Feed from "./farcaster/Feed";
// import CreateCast from "./farcaster/CreateCast";
import Links from "./ui/Links";
import snapShot from "./snapshot/SnapShot";
import Swap from "./swap/Swap";
import rss from "./ui/rss";
import VideoFidget from "./ui/Video";
import marketData from "./token/marketData";
import Portfolio from "./token/Portfolio";
import chat from "./ui/chat";
import TabFullScreen from "./layout/tabFullScreen";
import FramesFidget from "./framesV2/components/FramesFidget";
// import iframely from "./ui/iframely";

export const CompleteFidgets = {
  //
  example:
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ? Example : undefined,
  FramesV2: FramesFidget,
  profile:
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ? Profile : undefined,
  // Farcaster
  frame: Frame,
  // iframely: iframely,
  feed: Feed,
  cast: Cast,
  channel: Channel,
  // createCast: CreateCast,
  // Basic UI elements
  gallery: Gallery,
  text: TextFidget,
  iframe: IFrame,
  // Nouns
  governance: NounishGovernance,
  links: Links,
  // zora: zoraEmbed, -> 500 server error -Frame ancestors block
  SnapShot: snapShot,
  Swap: Swap,
  Rss: rss,
  Video: VideoFidget,
  Market: marketData,
  Portfolio: Portfolio,
  Chat: chat,
};

export const LayoutFidgets = {
  grid: Grid,
  tabFullScreen: TabFullScreen,
};
