import React from "react";
import { FidgetEditConfig, makeFidget } from "../../common/fidgets/makeFidget";
import TextInput from "@/common/ui/molecules/TextInput";

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
};

const Example: React.FC<ExampleFidgetSettings> = ({ text }: ExampleFidgetSettings) => {
  return (
    <div className="">
      { text }
    </div>
  );
};

const ExampleFidget = makeFidget<ExampleFidgetSettings>(Example, exampleConfig);

export default ExampleFidget;