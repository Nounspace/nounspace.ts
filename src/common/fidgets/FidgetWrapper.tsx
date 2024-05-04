"use client"
import React, { useState } from "react";
import { FidgetConfig, FidgetEditConfig, FidgetSettings } from "@/common/fidgets/makeFidget";
import { Card, CardContent, CardHeader } from "../ui/atoms/card";
import { Button } from "../ui/atoms/button";
import FidgetWrapperEditMode from "./FidgetWrapperEditMode";
import { toast } from "sonner";

export type FidgetWrapperConfig = {
  fidgetConfig: FidgetConfig<FidgetSettings>;
  readonly editConfig: FidgetEditConfig;
};

type FidgetWrapperProps = {
  fidget: React.FC<FidgetSettings>;
  config: FidgetWrapperConfig;
  saveConfig: (conf: FidgetConfig<FidgetSettings>) => Promise<boolean>
};

export function FidgetWrapper({ fidget, config, saveConfig }: FidgetWrapperProps) {
  console.log(fidget);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewEditor, setViewEditor] = useState(false);
  const [localConfig, setLocalConfig] = useState({
    ...config.fidgetConfig,
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
      await saveConfig(localConfig) ? setEditing(false) : toast.error("Failed to save fidget settings", { duration: 1000 });
      setSaving(false);
    } else {
      setEditing(true);
    }
  }

  // TO DO: Add support for resizing the Fidget
  // TO DO: Add support to set size of Fidget to size defined in the config
  
  return (
    <Card className="max-w-sm col-span-1">
      <CardHeader>
        {
          editing ? 
          <Button
            className="w-full"
            onClick={() => setViewEditor(!viewEditor)}
          >
            { viewEditor ? "View Fidget" : "View Editor" }
          </Button> : null
        }
        { config.fidgetConfig.editable ? 
          <Button
            className="w-full"
            onClick={toggleEditing}
          >
            { editing ? "Save": "Edit" }
          </Button> : null
        }
      </CardHeader>
      <CardContent>
        { 
          editing && viewEditor ? 
            <FidgetWrapperEditMode
              editConfig={config.editConfig}
              settings={localConfig.settings}
              setSettings={setSettings}
            />
            : fidget(config.fidgetConfig.settings)
        }
      </CardContent>
    </Card>
  );
}