import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import { BsPeople, BsPeopleFill } from "react-icons/bs";

export type Top8FidgetSettings = {
  username: string;
  size: number;
} & FidgetSettingsStyle;

const top8Properties: FidgetProperties = {
  fidgetName: "Top 8",
  icon: 0x1f465, // 👥
  mobileIcon: <BsPeople size={20} />,
  mobileIconSelected: <BsPeopleFill size={20} />,
  fields: [
    {
      fieldName: "username",
      displayName: "Farcaster Username",
      default: "nounspacetom",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
    {
      fieldName: "size",
      displayName: "Scale",
      required: false,
      default: 1,
      inputSelector: IFrameWidthSlider,
      group: "style",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Top8: React.FC<FidgetArgs<Top8FidgetSettings>> = ({
  settings,
}) => {
  const {
    username = "nounspacetom",
    size = 1,
    background,
    fidgetBorderColor,
    fidgetBorderWidth,
    fidgetShadow,
  } = settings;

  const trimmedUsername = username?.trim() || "nounspacetom";
  const iframeUrl = `https://farcaster-top-8-frie-c060.bolt.host/${encodeURIComponent(trimmedUsername)}`;

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        background,
        borderColor: fidgetBorderColor,
        borderWidth: fidgetBorderWidth,
        boxShadow: fidgetShadow,
      }}
      className="h-[calc(100dvh-220px)] md:h-full"
    >
      <iframe
        key={trimmedUsername}
        src={iframeUrl}
        title="Top 8"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          transform: `scale(${size})`,
          transformOrigin: "0 0",
          width: `${100 / size}%`,
          height: `${100 / size}%`,
        }}
        className="size-full"
        frameBorder="0"
      />
    </div>
  );
};

export default {
  fidget: Top8,
  properties: top8Properties,
} as FidgetModule<FidgetArgs<Top8FidgetSettings>>;
