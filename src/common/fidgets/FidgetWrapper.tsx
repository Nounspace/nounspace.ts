import React from "react";
import { Card, CardContent } from "@/common/components/atoms/card";
import { toast } from "sonner";
import {
  FidgetConfig,
  FidgetSettings,
  FidgetBundle,
  FidgetArgs,
  FidgetData,
  FidgetProperties,
  FidgetRenderContext,
} from ".";
import { reduce } from "lodash";
import FidgetSettingsEditor from "../components/organisms/FidgetSettingsEditor";
import CSSInput from "@/common/components/molecules/CSSInput";
import ScopedStyles from "@/common/components/molecules/ScopedStyles";

export type FidgetWrapperProps = {
  fidget: React.FC<FidgetArgs>;
  bundle: FidgetBundle;
  context?: FidgetRenderContext;
  saveConfig: (conf: FidgetConfig) => Promise<void>;
  setCurrentFidgetSettings: (currentFidgetSettings: React.ReactNode) => void;
  setSelectedFidgetID: (selectedFidgetID: string) => void;
  selectedFidgetID: string;
  removeFidget: (fidgetId: string) => void;
};

export const getSettingsWithDefaults = (
  settings: FidgetSettings,
  config: FidgetProperties,
): FidgetSettings => {
  return reduce(
    config.fields,
    (acc, f) => ({
      ...acc,
      [f.fieldName]:
        f.fieldName in settings
          ? settings[f.fieldName]
          : f.default || undefined,
    }),
    {},
  );
};

export function FidgetWrapper({
  fidget,
  bundle,
  saveConfig,
  setCurrentFidgetSettings,
  setSelectedFidgetID,
  selectedFidgetID,
  removeFidget,
}: FidgetWrapperProps) {
  function onClickEdit() {
    setSelectedFidgetID(bundle.id);
    setCurrentFidgetSettings(
      <FidgetSettingsEditor
        fidgetId={bundle.id}
        properties={bundle.properties}
        settings={settingsWithDefaults}
        onSave={onSave}
        unselect={unselect}
        removeFidget={removeFidget}
      />,
    );
  }

  const saveData = (data: FidgetData) => {
    return saveConfig({
      ...bundle.config,
      data,
    });
  };

  const settingsWithDefaults = getSettingsWithDefaults(
    bundle.config.settings,
    bundle.properties,
  );

  const onSave = async (newSettings: FidgetSettings) => {
    try {
      await saveConfig({
        ...bundle.config,
        settings: newSettings,
      });
    } catch (e) {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    }

    unselect();
  };

  function unselect() {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }

  const userStyles = bundle.properties.fields
    .filter((f) => f.inputSelector === CSSInput)
    .map((f) => settingsWithDefaults[f.fieldName]);

  return (
    <Card
      className={
        selectedFidgetID === bundle.id
          ? "size-full border-solid border-sky-600 border-4 rounded-2xl overflow-hidden"
          : "size-full overflow-hidden"
      }
    >
      {bundle.config.editable && (
        <button
          onMouseDown={onClickEdit}
          className="flex items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50 rounded-md"
        ></button>
      )}
      <ScopedStyles cssStyles={userStyles} className="size-full">
        <CardContent className="size-full">
          {fidget({
            settings: settingsWithDefaults,
            data: bundle.config.data,
            saveData,
          })}
        </CardContent>
      </ScopedStyles>
    </Card>
  );
}
