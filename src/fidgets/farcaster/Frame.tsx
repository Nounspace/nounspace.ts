import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import FrameEmbed from "./components/Embeds/FrameEmbed";

export type FrameFidgetSettings = {
  url: string;
};

const frameProperties: FidgetProperties = {
  fidgetName: "Frame",
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
  icon: 0x23f9, // ⏹
};

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = ({
  settings: { url },
}) => {
  return <FrameEmbed url={url} />;
};

const exp = {
  fidget: Frame,
  properties: frameProperties,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;

export default exp;
