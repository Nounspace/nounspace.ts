import React from "react";
import { Color } from "@/common/lib/theme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import { Slider } from "@mui/material";
import { ThemeSettingsTooltip } from "./ThemeSettingsTooltip";

interface StyleTabContentProps {
  background: Color | string;
  fidgetBackground: Color | string;
  fidgetBorderColor: Color | string;
  fidgetBorderWidth: string;
  fidgetShadow: string;
  fidgetBorderRadius: string;
  gridSpacing: string;
  onPropertyChange: (property: string) => (value: string) => void;
}

export const StyleTabContent: React.FC<StyleTabContentProps> = ({
  background,
  fidgetBackground,
  fidgetBorderColor,
  fidgetBorderWidth,
  fidgetShadow,
  fidgetBorderRadius,
  gridSpacing,
  onPropertyChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold my-2">Space Settings</h4>
        <div className="flex flex-row gap-1">
          <h4 className="text-sm">Background color</h4>
          <ThemeSettingsTooltip text="Set a solid background or gradient color. You can also add custom backgrounds with HTML/CSS on the Code tab." />
        </div>
        <ColorSelector
          className="rounded-full overflow-hidden w-6 h-6 shrink-0"
          innerClassName="rounded-full"
          value={background as Color}
          onChange={onPropertyChange("background")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold my-2">Fidget Settings</h4>
        <div className="flex flex-col gap-1">
          <div className="">
            <div className="flex flex-row gap-1">
              <h5 className="text-sm">Background color</h5>
              <ThemeSettingsTooltip text="Set the default background color for all Fidgets on your Space." />
            </div>
            <ColorSelector
              className="rounded-full overflow-hidden w-6 h-6 shrink-0 my-2"
              innerClassName="rounded-full"
              value={fidgetBackground as Color}
              onChange={onPropertyChange("fidgetBackground")}
            />
          </div>
          <div className="">
            <div className="flex flex-row gap-1">
              <h5 className="text-sm">Border</h5>
              <ThemeSettingsTooltip text="Set the default border width and color for all Fidgets on your Space." />
            </div>
            <div className="flex items-center gap-1">
              <ColorSelector
                className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                innerClassName="rounded-full"
                value={fidgetBorderColor as Color}
                onChange={onPropertyChange("fidgetBorderColor")}
              />
              <BorderSelector
                className="ring-0 focus:ring-0 border-0 shadow-none"
                value={fidgetBorderWidth as string}
                onChange={onPropertyChange("fidgetBorderWidth")}
                hideGlobalSettings
              />
            </div>
          </div>
          <div className="">
            <div className="flex flex-row gap-1">
              <h5 className="text-sm">Shadow</h5>
              <ThemeSettingsTooltip text="Set the default shadow for all Fidgets on your Space." />
            </div>
            <ShadowSelector
              className="ring-0 focus:ring-0 border-0 shadow-none"
              value={fidgetShadow as string}
              onChange={onPropertyChange("fidgetShadow")}
              hideGlobalSettings
            />
          </div>
          <div className="mt-2">
            <div className="flex flex-row gap-1">
              <h5 className="text-sm">Border Radius</h5>
              <ThemeSettingsTooltip text="Set the border radius for all Fidgets on your Space." />
            </div>
            <Slider
              value={parseInt(fidgetBorderRadius)}
              min={0}
              max={32}
              step={1}
              onChange={(_, v) =>
                onPropertyChange("fidgetBorderRadius")(`${v}px`)
              }
            />
          </div>
          <div className="mt-2">
            <div className="flex flex-row gap-1">
              <h5 className="text-sm">Spacing</h5>
              <ThemeSettingsTooltip text="Set spacing between Fidgets on the grid." />
            </div>
            <Slider
              value={parseInt(gridSpacing)}
              min={0}
              max={40}
              step={1}
              onChange={(_, v) =>
                onPropertyChange("gridSpacing")(String(v))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTabContent;
