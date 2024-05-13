export interface FidgetSettings {}

export type FidgetConfig<S extends FidgetSettings = FidgetSettings> = {
  editable: boolean;
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
      
export interface FidgetDetails<S extends FidgetSettings = FidgetSettings> {
  editConfig: FidgetEditConfig;
  instanceConfig: FidgetConfig<S>;
  id: string;
}

export interface LayoutFidgetConfig {}

export interface LayoutFidgetDetails {
  layoutFidget: string;
  layoutConfig: LayoutFidgetConfig;
}

export interface FidgetModule<P = unknown> {
  fidget: React.FC<P>;
  editConfig: FidgetEditConfig;
}

interface LayoutFigetProps {
  layoutConfig: LayoutFidgetConfig;
  fidgets: {
    [key: string]: ReactNode;
  };
  isEditable: boolean;
}

const LayoutFidgetDefaultProps = {
  fidgets: object,
  layoutConfig: object,
  isEditable: false,
}

export interface LayoutFiget<P extends LayoutFigetProps = LayoutFidgetDefaultProps> extends React.FC<P> {}