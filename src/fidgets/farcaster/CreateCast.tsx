import React from "react";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
} from "@/common/fidgets";
import CreateCastComponent from "./components/CreateCast";

export type CreateCastFidgetSettings = object;

const createCastProperties: FidgetProperties = {
  fidgetName: "Create Cast",
  fields: [],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
  icon: 0x270f, // ✏️
};

// ✅ Main Fidget Component
const CreateCast: React.FC<FidgetArgs<CreateCastFidgetSettings>> = () => {
  return <CreateCastComponent afterSubmit={() => {}} />;
};

// ✅ Export Fidget Module
const exp = {
  fidget: CreateCast,
  properties: createCastProperties,
} as FidgetModule<FidgetArgs<CreateCastFidgetSettings>>;

export default exp;
