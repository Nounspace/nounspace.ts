"use client"
import React, { useState } from "react";
import { FidgetConfig, FidgetSettings, GenericFidget } from "@/common/fidgets/makeFidget";
import { reduce } from "lodash";
import { FidgetWrapper, FidgetWrapperConfig } from "@/common/fidgets/FidgetWrapper";


export default function LazyFidgetViewer({ fidget }: { fidget: GenericFidget }) {
  const defaultConfig: FidgetWrapperConfig = {
    editConfig: fidget.fieldConfig,
    fidgetConfig: {
      editable: true,
      size: [1, 2],
      settings: reduce(
        fidget.fieldConfig.fields,
        (acc, f) => ({
          ...acc,
          [f.fieldName]: f.default || null,
        }),
        {},
      )
    },
  };
  const [config, setConfig] = useState<FidgetWrapperConfig>(defaultConfig);  
  const saveConifg = async (conf: FidgetConfig<FidgetSettings>) => {
    setConfig({
      editConfig: config.editConfig,
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