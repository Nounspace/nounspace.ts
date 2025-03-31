import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import { isUndefined } from "lodash";
import React from "react";
import EmbededCast from "./components/Embeds/EmbededCast";

type CastFidgetSettings = {
  castHash?: string;
  casterFid?: number;
  castUrl?: string;
  useDefaultColors?: boolean;
} & FidgetSettingsStyle;

const castFidgetProperties: FidgetProperties = {
  fidgetName: "Pinned Cast",
  icon: 0x1f4ac, // 💬
  fields: [
    {
      fieldName: "castHash",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "casterFid",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "castUrl",
      required: false,
      inputSelector: TextInput,
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 1,
    maxHeight: 4,
    minWidth: 3,
    maxWidth: 12,
  },
};

const Cast: React.FC<FidgetArgs<CastFidgetSettings>> = ({
  settings,
}) => {
  const { castHash, casterFid, castUrl } = settings;
  
  const castId =
    !isUndefined(castHash) && !isUndefined(casterFid)
      ? { hash: castHash, fid: casterFid }
      : undefined;

  if (isUndefined(castUrl) && isUndefined(castId)) {
    return "Must Cast URL or both Caster FID and Cast Hash";
  }

  return (
    <div
      style={{
        background: settings.useDefaultColors 
          ? 'var(--user-theme-fidget-background)'
          : settings.background,
        borderColor: settings.useDefaultColors
          ? 'var(--user-theme-fidget-border-color)'
          : settings.fidgetBorderColor,
      }}
    >
      <EmbededCast url={castUrl} castId={castId} />
    </div>
  );
};

const exp: FidgetModule<FidgetArgs<CastFidgetSettings>> = {
  fidget: Cast,
  properties: castFidgetProperties,
};

export default exp;
