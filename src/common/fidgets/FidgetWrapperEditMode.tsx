import React from "react";
import { FidgetEditConfig, FidgetSettings } from ".";

type FidgetWrapperSettingsEditorProps = {
  readonly editConfig: FidgetEditConfig;
  settings: FidgetSettings;
  setSettings: (settings: FidgetSettings) => void;
};

const FidgetWrapperSettingsEditor: React.FC<FidgetWrapperSettingsEditorProps> = (
  { settings, editConfig, setSettings }
) => {

  return (<></>);
};

export default FidgetWrapperSettingsEditor;