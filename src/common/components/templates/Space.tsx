import React, { useState, DragEvent, useEffect, useMemo, useRef } from "react";
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
} from "@/common/fidgets";
import { CompleteFidgets, LayoutFidgets } from "@/fidgets";
import { mapValues } from "lodash";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { ThemeSettings } from "@/common/lib/theme";
import Sidebar from "../organisms/Sidebar";

export type SpaceConfig = {
  fidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeSettings;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
};

export default function Space({ config, saveConfig }: SpaceArgs) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);

  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];

  function saveLayout(layout: LayoutFidgetConfig) {
    return saveConfig({
      ...config,
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig: {
          ...config.layoutDetails.layoutConfig,
          layout: layout,
        },
      },
    });
  }

  function saveFidgets(
    newLayoutConfig: LayoutFidgetConfig,
    newFidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  ) {
    return saveConfig({
      ...config,
      fidgetInstanceDatums: {
        ...config.fidgetInstanceDatums,
        ...newFidgetInstanceDatums,
      },
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig: { layout: [newLayoutConfig] },
      },
    });
  }

  function saveFidgetInstanceDatums(newFidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  }) {
    return saveConfig({
      ...config,
      fidgetInstanceDatums: newFidgetInstanceDatums,
    });
  }

  function saveTrayContents(fidgetTrayContents: FidgetInstanceData[]) {
    return saveConfig({
      ...config,
      fidgetTrayContents: fidgetTrayContents,
    });
  }

  function saveTheme(newTheme) {
    return saveConfig({
      ...config,
      theme: newTheme,
    });
  }

  return (
    <>
      <div className="flex w-full h-full">
        <div
          className={
            editMode
              ? "w-4/12 flex mx-auto transition-all duration-100 ease-out"
              : "w-3/12 flex mx-auto transition-all duration-100 ease-out"
          }
        >
          <Sidebar
            editMode={editMode}
            setEditMode={setEditMode}
            isEditable={config.isEditable}
            portalRef={portalRef}
          />
        </div>

        <div
          className={
            editMode
              ? "w-8/12 transition-all duration-100 ease-out p-8"
              : "w-9/12 transition-all duration-100 ease-out p-8"
          }
        >
          <LayoutFidget
            layoutConfig={{
              ...config.layoutDetails.layoutConfig,
            }}
            fidgetInstanceDatums={config.fidgetInstanceDatums}
            theme={config.theme}
            fidgetTrayContents={config.fidgetTrayContents}
            saveLayout={saveLayout}
            saveFidgets={saveFidgets}
            saveFidgetInstanceDatums={saveFidgetInstanceDatums}
            saveTrayContents={saveTrayContents}
            saveTheme={saveTheme}
            inEditMode={editMode}
            setEditMode={setEditMode}
            portalRef={portalRef}
          />
        </div>
      </div>
    </>
  );
}
