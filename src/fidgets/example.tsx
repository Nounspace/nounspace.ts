import React, { useState } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";

export type ExampleFidgetSettings = {
  text: string;
} & FidgetSettingsStyle;

const exampleProperties: FidgetProperties = {
  fidgetName: "example",
  icon: 0x2747, // This is the hex code for an emoji
  fields: [
    {
      fieldName: "displayText",
      default: "Hello World!",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
};

const Example: React.FC<FidgetArgs<ExampleFidgetSettings>> = ({
  settings: { text },
}) => {
  const [timesClicked, setTimesClicked] = useState(0);

  function incrementClicker() {
    setTimesClicked(timesClicked + 1);
  }

  return (
    <div>
      <button onClick={incrementClicker}>{text || "click me"}</button>I have
      been clicked {timesClicked}
    </div>
  );
};

export default {
  fidget: Example,
  properties: exampleProperties,
} as FidgetModule<FidgetArgs<ExampleFidgetSettings>>;
