import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { isValidUrl } from "@/common/lib/utils/url";
import { defaultStyleFields, ErrorWrapper } from "@/fidgets/helpers";
import SwitchButton from "@/common/components/molecules/SwitchButton";
import { BsCloud, BsCloudFill } from "react-icons/bs";
import Frameslayout from "./Frameslayout";

export type FramesFidgetSettings = {
  url: string;
  collapsed?: boolean;
} & FidgetSettingsStyle;

export const WithMargin: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mb-3 pt-3">{children}</div>
);

const frameConfig: FidgetProperties = {
  fidgetName: "Farcaster Mini App",
  mobileFidgetName: "Mini App",
  icon: 0x1f310, // 🌐
  mobileIcon: <BsCloud size={24} />,
  mobileIconSelected: <BsCloudFill size={24} />,
  fields: [
    {
      fieldName: "url",
      displayName: "Frame URL",
      displayNameHint: "Paste the Farcaster Frame URL you'd like to view",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "collapsed",
      displayName: "Collapsed",
      displayNameHint: "Show a collapsed preview instead of the full Mini App",
      default: false,
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <SwitchButton {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const FramesFidget: React.FC<FidgetArgs<FramesFidgetSettings>> = ({
  settings: { url, collapsed = false },
}) => {
  if (!url) {
    return (
      <ErrorWrapper icon="➕" message="Provide a Frame URL to display here." />
    );
  }
  if (!isValidUrl(url)) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }
  // Pass the URL and collapsed state as props to Frameslayout
  return <Frameslayout frameUrl={url} collapsed={collapsed} />;
};

export default {
  fidget: FramesFidget,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<FramesFidgetSettings>>;
