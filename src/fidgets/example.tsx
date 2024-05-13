import React from "react";
import TextInput from "@/common/ui/molecules/TextInput";
import { FidgetEditConfig, FidgetModule } from "@/common/fidgets";

export type ExampleFidgetSettings = {
  text: string,
}

const exampleConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "displayText",
      default: "Hello World!",
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

const Example: React.FC<ExampleFidgetSettings> = ({ text }: ExampleFidgetSettings) => {
  return (
    <div className="">
      { text }
    </div>
  );
};

export default {
  fidget: Example,
  editConfig: exampleConfig,
} as FidgetModule<ExampleFidgetSettings>;