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
import CSSInput from "@/common/components/molecules/CSSInput";
import ScopedStyles from "@/common/components/molecules/ScopedStyles";

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
  const [_saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const onClickEdit = useCallback(() => {
    setSelectedFidgetID(config.id);
    setEditing(true);
    setcurrentFidgetSettings(
      <FidgetSettingsEditor
        properties={config.properties}
        settings={settingsWithDefaults}
        onSave={onSave}
        unselect={unselect}
      />,
    );
  }, [setEditing]);

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
    setSaving(true);
    try {
      await saveConfig({
        ...config.config,
        settings: newSettings,
      });
      setEditing(false);
    } catch (e) {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    }
    setSaving(false);
    setEditing(false);
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  };

  function unselect() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }

  const userStyles = config.properties.fields
    .filter((f) => f.inputSelector === CSSInput)
    .map((f) => settingsWithDefaults[f.fieldName]);

  return (
    <>
      <Card
        className={
          selectedFidgetID === config.id
            ? "size-full border-solid border-sky-600 border-4 rounded-2xl overflow-scroll"
            : "size-full overflow-scroll"
        }
      >
        <ScopedStyles cssStyles={userStyles} className="size-full">
          <CardContent className="size-full">
            {fidget({
              settings: settingsWithDefaults,
              data: config.config.data,
              saveData,
            })}
          </CardContent>
        </ScopedStyles>
        {config.config.editable && (
          <button
            onMouseDown={onClickEdit}
            className="flex items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50 rounded-md"
          ></button>
        )}
      </Card>
    </>
  );
}
