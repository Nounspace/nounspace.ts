import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/ui/molecules/CSSInput";
import HTMLInput from "@/common/ui/molecules/HTMLInput";
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
    | typeof CSSInput
    | typeof HTMLInput;
  readonly default?: any;
  readonly required: boolean;
};

// Properties are developer defined variables (they are inaccessible to the user)
export type FidgetProperties = {
  fidgetName: string;
  icon: number;
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
  properties: FidgetProperties;
}

//TODO: Clean up this mess and do it properly

interface LayoutFidgetProps {
  layoutConfig: GridLayoutConfig;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  fidgetTrayContents: FidgetInstanceData[];
  theme: ThemeSettings;

  saveLayout(layout: LayoutFidgetConfig): Promise<void>;
  saveFidgetInstanceDatums(newFidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  }): Promise<void>;
  saveTrayContents(fidgetTrayContents: FidgetInstanceData[]): Promise<void>;
  saveTheme(newTheme: any): Promise<void>;

  inEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
}

type LayoutFidgetDefaultProps = {
  layoutConfig: GridLayoutConfig;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  fidgetTrayContents: FidgetInstanceData[];
  theme: ThemeSettings;

  saveLayout(layout: LayoutFidgetConfig): Promise<void>;
  saveFidgetInstanceDatums(newFidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  }): Promise<void>;
  saveTrayContents(fidgetTrayContents: FidgetInstanceData[]): Promise<void>;
  saveTheme(newTheme: any): Promise<void>;

  inEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
};

export interface LayoutFidget<
  P extends LayoutFidgetProps = LayoutFidgetDefaultProps,
> extends React.FC<P> {}
