import React, { useMemo } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import SwitchButton from "@/common/components/molecules/SwitchButton";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields, ErrorWrapper, WithMargin } from "@/fidgets/helpers";
import { BsTools } from "react-icons/bs";

export type BuilderScoreFidgetSettings = {
  fid: string;
  darkMode: boolean;
} & FidgetSettingsStyle;

const BASE_URL = "https://talent-score-eight.vercel.app";

const builderScoreProperties: FidgetProperties = {
  fidgetName: "Builder Score",
  icon: 0x1f528, // 🔨
  mobileIcon: <BsTools size={20} />,
  fields: [
    {
      fieldName: "fid",
      displayName: "FID",
      displayNameHint: "Enter the Farcaster ID whose Builder Score you want to display.",
      default: "230941",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "darkMode",
      displayName: "Dark Mode",
      displayNameHint: "Enable the dark theme for the Builder Score view.",
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
    minHeight: 3,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

const BuilderScore: React.FC<FidgetArgs<BuilderScoreFidgetSettings>> = ({
  settings,
}) => {
  const {
    fid = "230941",
    darkMode = false,
    background,
    fidgetBorderColor,
    fidgetBorderWidth,
    fidgetShadow,
  } = settings;

  const normalizedFid = fid?.toString().trim();

  const url = useMemo(() => {
    if (!normalizedFid) {
      return null;
    }

    const encodedFid = encodeURIComponent(normalizedFid);
    const query = darkMode ? "?dark=true" : "";

    return `${BASE_URL}/${encodedFid}${query}`;
  }, [normalizedFid, darkMode]);

  if (!normalizedFid || !url) {
    return (
      <ErrorWrapper
        icon="🔍"
        message="Provide a Farcaster FID to load the Builder Score."
      />
    );
  }

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
        key={`${normalizedFid}-${darkMode}`}
        src={url}
        title="Builder Score"
        className="size-full"
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-forms allow-modals allow-cursor-lock allow-orientation-lock allow-pointer-lock"
      />
    </div>
  );
};

export default {
  fidget: BuilderScore,
  properties: builderScoreProperties,
} as FidgetModule<FidgetArgs<BuilderScoreFidgetSettings>>;
