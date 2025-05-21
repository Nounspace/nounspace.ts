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
import { BsCloud, BsCloudFill } from "react-icons/bs";
import Frameslayout from "./Frameslayout";

export type FramesFidgetSettings = {
  url: string;
} & FidgetSettingsStyle;

export const WithMargin: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mb-3 pt-3">{children}</div>
);

const frameConfig: FidgetProperties = {
  fidgetName: "FramesV2",
  mobileFidgetName: "Frame",
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
  settings: { url },
}) => {
  if (!url) {
    return (
      <ErrorWrapper icon="➕" message="Provide a Frame URL to display here." />
    );
  }
  if (!isValidUrl(url)) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }
  // Pass the URL as a prop to Frameslayout
  return <Frameslayout frameUrl={url} />;
};

export default {
  fidget: FramesFidget,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<FramesFidgetSettings>>;
