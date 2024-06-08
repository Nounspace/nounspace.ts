import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/common/ui/atoms/card";
import { toast } from "sonner";
import {
  FidgetConfig,
  FidgetSettings,
  FidgetDetails,
  FidgetArgs,
  FidgetData,
  FidgetEditConfig,
  FidgetRenderContext,
} from ".";
import { FaGear } from "react-icons/fa6";
import FidgetSettingsPopover from "@/common/fidgets/FidgetSettingsPopover";
import { reduce } from "lodash";

export type FidgetWrapperProps = {
  fidget: React.FC<FidgetArgs>;
  config: FidgetDetails;
  context?: FidgetRenderContext;
  saveConfig: (conf: FidgetConfig) => Promise<void>;
};

export const getSettingsWithDefaults = (
  settings: FidgetSettings,
  config: FidgetEditConfig,
): FidgetSettings => {
  return reduce(
    config.fields,
    (acc, f) => ({
      ...acc,
      [f.fieldName]:
        f.fieldName in settings ? settings[f.fieldName] : f.default || null,
    }),
    {},
  );
};

export function FidgetWrapper({
  fidget,
  config,
  context,
  saveConfig,
}: FidgetWrapperProps) {
  const [_saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const onClickEdit = useCallback(() => {
    setEditing(true);
  }, [setEditing]);

  const saveData = (data: FidgetData) => {
    return saveConfig({
      ...config.instanceConfig,
      data,
    });
  };

  const settingsWithDefaults = getSettingsWithDefaults(
    config.instanceConfig.settings,
    config.editConfig,
  );

  const onSave = async (newSettings: FidgetSettings) => {
    setSaving(true);
    try {
      await saveConfig({
        ...config.instanceConfig,
        settings: newSettings,
      });
      setEditing(false);
    } catch (e) {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    }
    setSaving(false);
  };

  return (
    <Card className="size-full overflow-scroll">
      {config.instanceConfig.editable && (
        <div className="flex items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50 rounded-md">
          <button
            onClick={onClickEdit}
            className="absolute flex-1 size-1/12 opacity-50 hover:opacity-100 duration-500 z-10 flex justify-center items-center text-white font-semibold text-2xl"
          >
            <FaGear />
          </button>
        </div>
      )}
      <CardContent className="size-full">
        {fidget({
          settings: settingsWithDefaults,
          data: config.instanceConfig.data,
          saveData,
        })}
        <FidgetSettingsPopover
          open={editing}
          setOpen={setEditing}
          onSave={onSave}
          editConfig={config.editConfig}
          settings={settingsWithDefaults}
        />
      </CardContent>
    </Card>
  );
}
