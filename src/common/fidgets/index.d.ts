import TextInput from "@/common/ui/molecules/TextInput";
import ColorSelector from "@/common/ui/molecules/ColorSelector";
import FontSelector from "@/common/ui/molecules/FontSelector";

export interface FidgetSettings {}

export type FidgetConfig<S extends FidgetSettings = FidgetSettings> = {
  editable: boolean;
  settings: S;
};

export type FidgetFieldConfig = {
  readonly fieldName: string;
  readonly validator?: (value) => boolean;
  readonly inputSelector: typeof TextInput | typeof ColorSelector | typeof FontSelector;
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

interface LayoutFidgetProps {
  layoutConfig: LayoutFidgetConfig;
  fidgets: {
    [key: string]: ReactNode;
  };
  isEditable: boolean;
  isEditing: boolean;
}

type LayoutFidgetDefaultProps = {
  fidgets: object,
  layoutConfig: object,
  isEditable: boolean,
  isEditing: boolean
}

export interface LayoutFidget<P extends LayoutFidgetProps = LayoutFidgetDefaultProps> extends React.FC<P> {}
