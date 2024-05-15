"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/atoms/card";
import { Button } from "../ui/atoms/button";
import FidgetWrapperEditMode from "./FidgetWrapperEditMode";
import { toast } from "sonner";
import { FidgetConfig, FidgetSettings, FidgetDetails } from ".";
import { FaGear } from "react-icons/fa6";

type FidgetWrapperProps = {
  fidget: React.FC<FidgetSettings>;
  config: FidgetDetails;
  saveConfig: (conf: FidgetConfig<FidgetSettings>) => Promise<boolean>;
};

export function FidgetWrapper({ fidget, config, saveConfig }: FidgetWrapperProps) {
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewEditor, setViewEditor] = useState(false);
  const [localConfig, setLocalConfig] = useState<FidgetConfig<FidgetSettings>>({
    ...config.instanceConfig,
  });
  const setSettings = (settings: FidgetSettings) => {
    setLocalConfig({
      ...localConfig,
      settings,
    });
  };

  async function toggleEditing() {
    if (editing) {
      setSaving(true);
      (await saveConfig(localConfig)) ? setEditing(false) : toast.error("Failed to save fidget settings", { duration: 1000 });
      setSaving(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Card className="size-full">
      {editing ? (
        <Button className="flex items-center justify-center opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50" onClick={() => setViewEditor(!viewEditor)}>
          {viewEditor ? "View Fidget" : "View Editor"}
        </Button>
      ) : null}
      {config.instanceConfig.editable ? (
        <div className="flex items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50 rounded-md">
          <button onClick={toggleEditing} className="absolute flex-1 size-1/12 opacity-50 hover:opacity-100 duration-500 z-10 flex justify-center items-center text-white font-semibold text-2xl">
            <FaGear />
          </button>
        </div>
      ) : null}
      <CardContent className="size-full">
        {editing && viewEditor ? <FidgetWrapperEditMode editConfig={config.editConfig} settings={localConfig.settings} setSettings={setSettings} /> : fidget(config.instanceConfig.settings)}
      </CardContent>
    </Card>
  );
}
