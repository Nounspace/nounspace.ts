"use client";
import React, { useState } from "react";
import { reduce } from "lodash";
import { FidgetWrapper, FidgetWrapperConfig } from "@/common/fidgets/FidgetWrapper";
import { FidgetConfig, FidgetModule, FidgetSettings } from ".";

export default function FidgetViewer({ fidgetModule }: { fidgetModule: FidgetModule }) {
  const defaultConfig: FidgetWrapperConfig = {
    editConfig: fidgetModule.editConfig,
    fidgetConfig: {
      editable: true,
      size: [1, 2],
      settings: reduce(
        fidgetModule.editConfig.fields,
        (acc, f) => ({
          ...acc,
          [f.fieldName]: f.default || null,
        }),
        {}
      ),
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

  return <FidgetWrapper config={config} saveConfig={saveConifg} fidget={fidgetModule.fidget} />;
}
