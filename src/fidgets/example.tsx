import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetEditConfig, FidgetModule } from "@/common/fidgets";

export type ExampleFidgetSettings = {
  text: string;
};

const exampleConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "displayText",
      default: "Hello World!",
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
  name: "Example",
};

const Example: React.FC<FidgetArgs<ExampleFidgetSettings>> = ({
  settings: { text },
}) => <div className="">{text}</div>;

export default {
  fidget: Example,
  editConfig: exampleConfig,
} as FidgetModule<FidgetArgs<ExampleFidgetSettings>>;
