import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/ui/molecules/CSSInput";
import HTMLInput from "@/common/ui/molecules/HTMLInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import type { ThemeSettings, FontFamily, Color } from "@/common/lib/theme";

export type FidgetSettings = Record<string, any>;
export type FidgetSettingsStyle = {
  background?: Color;
  fontFamily?: FontFamily;
  fontColor?: Color;
  headingsFontFamily?: FontFamily;
  headingsFontColor?: Color;
  fidgetBorderWidth?: string;
  fidgetBorderColor?: Color;
  fidgetShadow?: string;
};
export type FidgetData = Record<string, any>;

export type FidgetConfig<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> = {
  editable: boolean;
  settings: S;
  data: D;
};

export type FidgetGroup = "settings" | "style" | "code";

export type FidgetFieldConfig<S extends FidgetSettings = FidgetSettings> = {
  readonly fieldName: string;
  readonly displayName?: string;
  readonly validator?: (value) => boolean;
  readonly inputSelector:
    | typeof TextInput
    | typeof ColorSelector
    | typeof FontSelector
    | typeof CSSInput
    | typeof HTMLInput;
  readonly default?: any;
  readonly required: boolean;
  readonly group?: FidgetGroup;
  readonly disabledIf?: (settings: S) => boolean;
};

// Properties are developer defined variables (they are inaccessible to the user)
export type FidgetProperties<S extends FidgetSettings = FidgetSettings> = {
  fidgetName: string;
  icon: number;
  fields: FidgetFieldConfig<S>[];
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

export type FidgetInstanceData<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> = {
  config: FidgetConfig<S, D>;
  fidgetType: string;
  id: string;
};

export type FidgetBundle<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> = FidgetInstanceData<S, D> & {
  properties: FidgetProperties;
};

export interface LayoutFidgetConfig<L> {
  layout: L;
}

export interface LayoutFidgetDetails<C extends LayoutFidgetConfig> {
  layoutFidget: string;
  layoutConfig: C;
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
  properties: FidgetProperties;
}

type LayoutFidgetSavableConfig<C extends LayoutFidgetConfig> = {
  fidgetInstanceDatums?: {
    [key: string]: FidgetInstanceData;
  };
  layoutConfig?: C;
  fidgetTrayContents?: FidgetInstanceData[];
  theme?: UserTheme;
};

interface LayoutFidgetProps<C extends LayoutFidgetConfig> {
  layoutConfig: C;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  fidgetTrayContents: FidgetInstanceData[];
  theme: ThemeSettings;
  saveConfig(config: LayoutFidgetSavableConfig<C>): Promise<void>;

  inEditMode: boolean;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
  portalRef: React.RefObject<HTMLDivElement>;

  hasProfile: boolean;
  hasFeed: boolean;
}

type LayoutFidgetDefaultProps = LayoutFidgetProps;

export type LayoutFidget<
  P extends LayoutFidgetProps = LayoutFidgetDefaultProps,
> = React.FC<P>;
