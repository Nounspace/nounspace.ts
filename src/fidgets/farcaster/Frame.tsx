import BorderSelector from "@/common/components/molecules/BorderSelector";
import ImageScaleSlider from "@/common/components/molecules/ImageScaleSlider";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { isValidUrl } from "@/common/lib/utils/url";
import React from "react";
import { BsAspectRatio, BsAspectRatioFill } from "react-icons/bs";
import { mobileStyleSettings, WithMargin } from "../helpers";
import FrameEmbed from "./components/Embeds/FrameEmbed";

export type FrameFidgetSettings = {
  url: string;
} & FidgetSettingsStyle;

const frameProperties: FidgetProperties = {
  fidgetName: "Farcaster Frame",
  mobileFidgetName: "Frame",
  mobileIcon: <BsAspectRatio size={22} />,
  mobileIconSelected: <BsAspectRatioFill size={22} />,
  fields: [
    ...mobileStyleSettings,
    {
      fieldName: "url",
      displayName: "URL",
      displayNameHint: "Paste the URL to the Frame you want to embed.",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "Scale",
      displayName: "Scale",
      displayNameHint: "Drag the slider to adjust the image size.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ImageScaleSlider {...props} />
        </WithMargin>
      ),
      default: 1,
      group: "style",
    },
    {
      fieldName: "background",
      displayName: "Background",
      displayNameHint: "Color used for the background of the Fidget",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-background-color)"
          defaultColor="#FFFFFF"
          colorType="background"
        />
      </WithMargin>
      ),
      group: "style",
      default: "var(--user-theme-fidget-background)",
    },
    {
      fieldName: "fidgetBorderWidth",
      displayName: "Fidget Border Width",
      displayNameHint: "Width of the border. Use Theme Border to inherit from Theme",
      default: "var(--user-theme-fidget-border-width)",
      required: false,
      inputSelector: (props) => (
           <WithMargin>
            <BorderSelector 
             {...props} 
             hideGlobalSettings={false}
           />
           </WithMargin>
         ),
      group: "style",
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
    },
    {
      fieldName: "fidgetShadow",
      displayName: "Fidget Shadow",
      displayNameHint: "Shadow effect. Use Theme Shadow to inherit from Theme",
      default: "var(--user-theme-fidget-shadow)",
         required: false,
         inputSelector: (props) => (
           <WithMargin>
             <ShadowSelector
              {...props} 
              hideGlobalSettings={false}
            />
           </WithMargin>
         ),
      group: "style",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
  icon: 0x23f9, // ⏹
};

const DISALLOW_URL_PATTERNS = [
  /javascript:/i,
  /^data:/i,
  /<script/i,
  /%3Cscript/i,
];

const ErrorWrapper: React.FC<{
  message: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ message, icon }) => {
  return (
    <div className="flex flex-col gap-1 size-full items-center justify-center text-center p-4 absolute top-0 right-0 bottom-0 left-0 bg-white border border-gray-200 rounded-lg">
      {icon && <div className="text-[20px]">{icon}</div>}
      <p className="text-gray-400 font-semibold text-sm leading-tight max-w-[60ch]">
        {message}
      </p>
    </div>
  );
};

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = ({
  settings: { url },
}) => {
  const isValid = isValidUrl(url);
  const sanitizedUrl = useSafeUrl(url, DISALLOW_URL_PATTERNS);

  if (!url) {
    return <ErrorWrapper icon="➕" message="Provide a URL to display here." />;
  }

  if (!isValid) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }

  if (!sanitizedUrl) {
    return (
      <ErrorWrapper
        icon="🔒"
        message={`This URL cannot be displayed due to security restrictions (${url}).`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
      <FrameEmbed url={url} />
    </div>
  );
};

const exp = {
  fidget: Frame,
  properties: frameProperties,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;

export default exp;
