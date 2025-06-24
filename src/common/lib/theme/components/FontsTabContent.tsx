import React from "react";
import { Color } from "@/common/lib/theme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import ThemeSettingsTooltip from "./ThemeSettingsTooltip";
import BackgroundGenerator from "../BackgroundGenerator";

interface FontsTabContentProps {
  headingsFontColor: Color | string;
  headingsFont: string;
  fontColor: Color | string;
  font: string;
  backgroundHTML: string;
  onPropertyChange: (property: string) => (value: string) => void;
}

export const FontsTabContent: React.FC<FontsTabContentProps> = ({
  headingsFontColor,
  headingsFont,
  fontColor,
  font,
  backgroundHTML,
  onPropertyChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-1">
          <h4 className="text-sm">Headings</h4>
          <ThemeSettingsTooltip text="The primary, or header font that Fidgets can inherit." />
        </div>
        <div className="flex items-center gap-1">
          <ColorSelector
            className="rounded-full overflow-hidden w-6 h-6 shrink-0"
            innerClassName="rounded-full"
            value={headingsFontColor as Color}
            onChange={onPropertyChange("headingsFontColor")}
          />
          <FontSelector
            className="ring-0 focus:ring-0 border-0 shadow-none"
            value={headingsFont}
            onChange={onPropertyChange("headingsFont")}
            hideGlobalSettings
            isThemeEditor
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-1">
          <h4 className="text-sm">Body</h4>
          <ThemeSettingsTooltip text="The secondary, or body font that Fidgets can inherit." />
        </div>
        <div className="flex items-center gap-1">
          <ColorSelector
            className="rounded-full overflow-hidden w-6 h-6 shrink-0"
            innerClassName="rounded-full"
            value={fontColor as Color}
            onChange={onPropertyChange("fontColor")}
          />
          <FontSelector
            className="ring-0 focus:ring-0 border-0 shadow-none"
            value={font}
            onChange={onPropertyChange("font")}
            hideGlobalSettings
            isThemeEditor
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <BackgroundGenerator
          backgroundHTML={backgroundHTML}
          onChange={onPropertyChange("backgroundHTML")}
        />
      </div>
    </div>
  );
};

export default FontsTabContent;
