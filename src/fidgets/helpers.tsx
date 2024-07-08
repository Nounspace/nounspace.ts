import ColorSelector from "@/common/components/molecules/ColorSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";

import { type FidgetFieldConfig } from "@/common/fidgets";

export const defaultStyleFields: FidgetFieldConfig[] = [
  {
    fieldName: "background",
    default: "var(--user-theme-fidget-background)",
    required: false,
    inputSelector: ColorSelector,
    group: "style",
  },
  {
    fieldName: "fidgetBorderWidth",
    default: "var(--user-theme-fidget-border-width)",
    required: false,
    inputSelector: BorderSelector,
    group: "style",
  },
  {
    fieldName: "fidgetBorderColor",
    default: "var(--user-theme-fidget-border-color)",
    required: false,
    inputSelector: ColorSelector,
    group: "style",
  },
  {
    fieldName: "fidgetShadow",
    default: "var(--user-theme-fidget-shadow)",
    required: false,
    inputSelector: ShadowSelector,
    group: "style",
  },
];
