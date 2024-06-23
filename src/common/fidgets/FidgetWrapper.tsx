import React, { useState, useCallback } from "react";
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

export type FidgetWrapperProps = {
  fidget: React.FC<FidgetArgs>;
  bundle: FidgetBundle;
  context?: FidgetRenderContext;
  saveConfig: (conf: FidgetConfig) => Promise<void>;
  setcurrentFidgetSettings: (currentFidgetSettings: React.ReactNode) => void;
  setSelectedFidgetID: (selectedFidgetID: string) => void;
  selectedFidgetID: string;
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
        f.fieldName in settings ? settings[f.fieldName] : f.default || null,
    }),
    {},
  );
};

export function FidgetWrapper({
  fidget,
  bundle: config,
  context,
  saveConfig,
  setcurrentFidgetSettings,
  setSelectedFidgetID,
  selectedFidgetID,
}: FidgetWrapperProps) {
  function onClickEdit() {
    setSelectedFidgetID(config.id);
    setcurrentFidgetSettings(
      <FidgetSettingsEditor
        properties={config.properties}
        settings={settingsWithDefaults}
        onSave={onSave}
        unselect={unselect}
      />,
    );
  }

  const saveData = (data: FidgetData) => {
    return saveConfig({
      ...config.config,
      data,
    });
  };

  const settingsWithDefaults = getSettingsWithDefaults(
    config.config.settings,
    config.properties,
  );

  const onSave = async (newSettings: FidgetSettings) => {
    try {
      await saveConfig({
        ...config.config,
        settings: newSettings,
      });
    } catch (e) {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    }

    unselect();
  };

  function unselect() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }

  return (
    <Card
      className={
        selectedFidgetID === config.id
          ? "size-full border-solid border-sky-600 border-4 rounded-2xl overflow-hidden"
          : "size-full overflow-hidden"
      }
    >
      {config.config.editable && (
        <button
          onMouseDown={onClickEdit}
          className="flex items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50 rounded-md"
        ></button>
      )}
      <CardContent className="size-full">
        {fidget({
          settings: settingsWithDefaults,
          data: config.config.data,
          saveData,
        })}
      </CardContent>
    </Card>
  );
}
