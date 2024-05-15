"use client";
import React, { useEffect, useState } from "react";
import { FidgetConfig, FidgetSettings, Fidget } from "@/common/fidgets/makeFidget";
import { reduce } from "lodash";
import { FidgetWrapper, FidgetWrapperConfig } from "@/common/fidgets/FidgetWrapper";
import { useLazyFidget } from "./useLazyFidget";

export default function LazyFidgetViewer({ fidgetPath }: { fidgetPath: string }) {
  // This doesn't work if the FidgetPath is relative
  // Building a separate Fidget's package might solve the issue
  // But that will take testing
  const lazyFidget = useLazyFidget(fidgetPath);
  const [config, setConfig] = useState<FidgetWrapperConfig>({
    editConfig: { fields: [], size: { minHeight: 1, maxHeight: 36, minWidth: 1, maxWidth: 36 } },
    fidgetConfig: { editable: true, size: [1, 1], settings: {} },
  });
  const saveConifg = async (conf: FidgetConfig<FidgetSettings>) => {
    setConfig({
      editConfig: config.editConfig,
      fidgetConfig: conf,
    });
    return true;
  };

  useEffect(() => {
    if (lazyFidget.status === "Success") {
      const fidget = lazyFidget.result;
      const defaultConfig: FidgetWrapperConfig = {
        editConfig: fidget.editConfig,
        fidgetConfig: {
          editable: true,
          size: [1, 2],
          settings: reduce(
            fidget.editConfig.fields,
            (acc, f) => ({
              ...acc,
              [f.fieldName]: f.default || null,
            }),
            {}
          ),
        },
      };
      setConfig(defaultConfig);
    }
  }, [lazyFidget]);

  return (
    <>
      {lazyFidget.status === "Loading" ? (
        <div>Loading...</div>
      ) : lazyFidget.status === "Success" ? (
        <FidgetWrapper config={config} saveConfig={saveConifg} fidget={lazyFidget.result} />
      ) : (
        <div>Error!</div>
      )}
    </>
  );
}
