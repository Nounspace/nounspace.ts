export interface FidgetSettings {
}

export type FidgetConfig<S> = {
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
};

export type FidgetModule<P> = {
  fidget: React.FC<P>;
  fieldConfig: FidgetEditConfig;
};

export async function importFidget(fidgetName) {
  return await import(`./${fidgetName}`) as FidgetModule<FidgetSettings>;
}
