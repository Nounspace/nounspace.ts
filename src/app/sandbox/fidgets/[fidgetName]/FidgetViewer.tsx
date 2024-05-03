import React, { use, useState } from "react";
import { FidgetConfig, FidgetModule, FidgetSettings, importFidget } from "@/fidgets";
import { chain } from "lodash";
import { FidgetWrapper, FidgetWrapperConfig } from "@/common/fidgets/FidgetWrapper";


export default function FidgetViewer({ fidget, fieldConfig }: FidgetModule<FidgetSettings>) {
  const defaultConfig: FidgetWrapperConfig = {
    editConfig: fieldConfig,
    fidgetConfig: {
      editable: true,
      size: [1, 2],
      settings: chain(fieldConfig).keyBy("fieldName").mapValues("default").value()
    },
  };
  const [config, setConfig] = useState(defaultConfig);
  const saveConifg = async (conf: FidgetConfig<FidgetSettings>) => {
    setConfig({
      editConfig: fieldConfig,
      fidgetConfig: conf,
    });
    return true;
  };

  return (
    <FidgetWrapper
      config={config}
      saveConfig={saveConifg}
      fidget={fidget}
    />
  );
}