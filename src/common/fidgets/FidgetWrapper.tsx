"use client"
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/atoms/card";
import { Button } from "../ui/atoms/button";
import FidgetWrapperEditMode from "./FidgetWrapperEditMode";
import { toast } from "sonner";
import { FidgetConfig, FidgetSettings, FidgetDetails } from ".";

type FidgetWrapperProps = {
  fidget: React.FC<FidgetSettings>;
  config: FidgetDetails;
  saveConfig: (conf: FidgetConfig<FidgetSettings>) => Promise<boolean>
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
      await saveConfig(localConfig) ? setEditing(false) : toast.error("Failed to save fidget settings", { duration: 1000 });
      setSaving(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Card style={{width: "100%", height: "100%"}}>
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
        { config.instanceConfig.editable ? 
          <Button
            className="w-full"
            onClick={toggleEditing}
          >
            { editing ? "Save": "Edit" }
          </Button> : null
        }
      </CardHeader>
      <CardContent style={{position: "relative", width: "100%", height: "100%" }}>
        { 
          editing && viewEditor ? 
            <FidgetWrapperEditMode
              editConfig={config.editConfig}
              settings={localConfig.settings}
              setSettings={setSettings}
            />
            : fidget(config.instanceConfig.settings)
        }
      </CardContent>
    </Card>
  );
}