import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/common/ui/atoms/popover";
import { FidgetSettings } from "@/common/fidgets";
import FidgetSettingsEditor, {
  FidgetSettingsEditorProps,
} from "@/common/ui/organisms/FidgetSettingsEditor";

type FidgetSettingsPopoverProps = FidgetSettingsEditorProps & {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (newSettings: FidgetSettings) => void;
};

export const FidgetSettingsPopover: React.FC<FidgetSettingsPopoverProps> = ({
  open,
  setOpen,
  onSave,
  editConfig,
  settings,
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor />
      <PopoverContent
        align="center"
        side="bottom"
        onMouseDown={(e) => e.stopPropagation()}
        className=""
      >
        <FidgetSettingsEditor
          editConfig={editConfig}
          settings={settings}
          onSave={onSave}
        />
      </PopoverContent>
    </Popover>
  );
};

export default FidgetSettingsPopover;
