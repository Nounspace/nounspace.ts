import { FidgetEditConfig, FidgetModule } from "..";
import { ExampleFidget, ExampleFidgetSettings} from "./ExampleFidget";
import TextInput from "@/common/ui/molecules/TextInput";

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

export default {
  fidget: ExampleFidget,
  fieldConfig: exampleConfig,
} as FidgetModule<ExampleFidgetSettings>;