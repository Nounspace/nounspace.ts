import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { isUndefined } from "lodash";
import React from "react";
import { BsFillPinFill, BsPin } from "react-icons/bs";
import { defaultStyleFields, WithMargin } from "../helpers";
import EmbededCast from "./components/Embeds/EmbededCast";

type CastFidgetSettings = {
  castHash?: string;
  casterFid?: number;
  castUrl?: string;
  useDefaultColors?: boolean;
} & FidgetSettingsStyle;

const castFidgetProperties: FidgetProperties = {
  fidgetName: "Pinned Cast",
  mobileFidgetName: "Pinned",
  icon: 0x1f4ac, // 💬
  mobileIcon: <BsPin size={22} />,
  mobileIconSelected: <BsFillPinFill size={22} />,
  fields: [
    {
      fieldName: "castUrl",
      displayName: "Cast URL",
      displayNameHint: "Copy and paste the URL of a cast from Warpcast's share button. This is the easiest way to pin a cast.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "castHash",
      displayName: "Cast Hash",
      displayNameHint: "Copy and paste the hash from a cast's ellipsis menu on Warpcast. Then input the caster's FID.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "casterFid",
      displayName: "Caster FID",
      displayNameHint: "Copy and paste the FID from the caster's profile About section. Then input the Cast Hash if you haven't already.",
      required: false,
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
    return "Must input either Cast URL or both Caster FID and Cast Hash";
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
