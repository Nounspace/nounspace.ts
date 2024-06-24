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
import { UserTheme } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import Sidebar from "../organisms/Sidebar";

export type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>;
  fidgetType: string;
  id: string;
};

export type SpaceConfig = {
  fidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
  theme: UserTheme;
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
  commitConfig: () => Promise<void>;
};

export default function Space({ config, saveConfig, commitConfig }: SpaceArgs) {
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
        layoutConfig: { ...newLayoutConfig },
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
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
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
