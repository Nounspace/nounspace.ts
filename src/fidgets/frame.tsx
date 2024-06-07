import React from 'react';
import FrameComponent from '@/common/ui/molecules/Frame';
import TextInput from "@/common/ui/molecules/TextInput";

import { FidgetArgs, FidgetEditConfig, FidgetModule } from "@/common/fidgets";

export type FrameFidgetSettings = {
  url: string,
}

const frameConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
    }
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  }
};

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = ({ settings: { url } }) => {
    return (
      <FrameComponent url = { url }/>
    )
}

export default {
  fidget: Frame,
  editConfig: frameConfig,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;