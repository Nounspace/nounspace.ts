import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/ui/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import type { ThemeSettings } from "@/common/lib/theme";

export type FidgetSettings = Record<string, any>;
export type FidgetData = Record<string, any>;

export type FidgetConfig<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> = {
  editable: boolean;
  settings: S;
  data: D;
};

export type FidgetFieldConfig = {
  readonly fieldName: string;
  readonly validator?: (value) => boolean;
  readonly inputSelector:
    | typeof TextInput
    | typeof ColorSelector
    | typeof FontSelector
    | typeof CSSInput;
  readonly default?: any;
  readonly required: boolean;
};

// Developer Defined Variables (inaccessible to the user)
export type FidgetEditConfig = {
  fidgetName: string;
  fields: FidgetFieldConfig[];
  size: {
    minHeight: NumericRange<1, 36>;
    maxHeight: NumericRange<1, 36>;
    minWidth: NumericRange<1, 36>;
    maxWidth: NumericRange<1, 36>;
  };
};

export type FidgetRenderContext = {
  theme: ThemeSettings;
};

export interface FidgetDetails<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> {
  editConfig: FidgetEditConfig;
  instanceConfig: FidgetConfig<S, D>;
  id: string;
}

export interface LayoutFidgetConfig {}

export interface LayoutFidgetDetails {
  layoutFidget: string;
  layoutConfig: LayoutFidgetConfig;
}

export interface FidgetArgs<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> {
  settings: S;
  data: D;
  saveData: (data: D) => Promise<void>;
}

export interface FidgetModule<P extends FidgetArgs> {
  fidget: React.FC<P>;
  editConfig: FidgetEditConfig;
}

interface LayoutFidgetProps {
  layoutConfig: LayoutFidgetConfig;
  fidgets: {
    [key: string]: ReactNode;
  };
  inEditMode: boolean;
}

type LayoutFidgetDefaultProps = {
  fidgets: object;
  layoutConfig: object;
  inEditMode: boolean;
};

export interface LayoutFidget<
  P extends LayoutFidgetProps = LayoutFidgetDefaultProps,
> extends React.FC<P> {}
