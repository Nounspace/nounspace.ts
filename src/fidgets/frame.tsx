import React from "react";
import FrameComponent from "@/common/components/molecules/Frame";
import TextInput from "@/common/components/molecules/TextInput";

import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";

export type FrameFidgetSettings = {
  url: string;
};

const frameConfig: FidgetProperties = {
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
};

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = ({
  settings: { url },
}) => {
  return <FrameComponent url={url} />;
};

export default {
  fidget: Frame,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;
