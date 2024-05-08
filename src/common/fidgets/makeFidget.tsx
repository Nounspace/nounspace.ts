import { NumericRange } from "@/constants/numericRange";
import React from "react";

export interface FidgetSettings {
  // TO DO: infer values here backed off the related config file
}

export type FidgetConfig<S extends FidgetSettings> = {
  editable: boolean;
  size: [number, number];
  settings: S;
};

export type FidgetFieldConfig = {
  readonly fieldName: string;
  readonly validator?: (value) => boolean;
  // This should be changed to a set of allowed input selectors
  readonly inputSelector: React.FC;
  readonly default?: any;
  readonly required: boolean;
};

export type FidgetEditConfig = {
  fields: FidgetFieldConfig[];
  size: {
    minHeight: NumericRange<1,36>;
    maxHeight: NumericRange<1,36>;
    minWidth: NumericRange<1,36>;
    maxWidth: NumericRange<1,36>;
  }
};
      
export interface Fidget<P> extends React.FC<P> {
  editConfig: FidgetEditConfig;
}

export type GenericFidget = Fidget<FidgetSettings>;

export function makeFidget<S>(component: React.FC<S>, editConfig: FidgetEditConfig): Fidget<S> {
  const componentAny: any = component;
  componentAny.editConfig = editConfig;
  return componentAny;
}