import React from "react";
import Space, { SpaceConfig } from "@/common/ui/templates/Space";
import { useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import {
  GridLayout,
  ResizeDirections,
} from "@/fidgets/layout/Grid";
import { LayoutFidgetDetails } from "@/common/fidgets";
import { NextPageWithLayout } from "../_app";
import Home from "@/common/ui/templates/Home";

const Homebase: NextPageWithLayout = () => {
  const [editMode, setMode] = useState(false);

  const availableHandles = [
    "s",
    "w",
    "e",
    "n",
    "sw",
    "nw",
    "se",
    "ne",
  ] as ResizeDirections[];
  const defaultLayoutData = [
    {
      i: "gallery",
      resizeHandles: availableHandles,
      x: 0,
      y: 0,
      w: 6,
      minW: 1,
      maxW: 12,
      h: 10,
      minH: 1,
      maxH: 12,
    },
    {
      i: "frame",
      resizeHandles: availableHandles,
      x: 6,
      y: 0,
      w: 3,
      minW: 2,
      maxW: 4,
      h: 6,
      minH: 3,
      maxH: 12,
    },
  ];

  const fidgets = {
    gallery: {
      fidgetName: "gallery",
      id: "gallery",
      instanceConfig: {
        editable: false,
        settings: {
          imageUrl: "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
        },
      },
    },  
    frame: {
      fidgetName: "frame",
      id: "frame",
      instanceConfig: {
        settings: {
          url: "https://altumbase.com/degen/4888/dIVWKaIQZR",
        },
        editable: false,
      },
    },
  };

  function switchMode() {
    setMode(!editMode);
  }

  const gridDetails: GridLayout = {
    isDraggable: false,
    isResizable: false,
    items: 4,
    cols: 12,
    rowHeight: 70,
    onLayoutChange: () => {},
    onDrop: () => {},
    // This turns off compaction so you can place items wherever.
    compactType: null,
    // This turns off rearrangement so items will not be pushed arround.
    preventCollision: true,
    maxRows: 9,
    layout: defaultLayoutData,
  };
  const layoutID = "";
  const layoutDetails: LayoutFidgetDetails = {
    layoutConfig: gridDetails,
    layoutFidget: "grid",
  };

  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig>({
    layoutID,
    layoutDetails,
    fidgetConfigs: fidgets,
  });

  async function saveConfig(config: SpaceConfig) {
    setSpaceConfig(config);
    return true;
  }

  return (
    <div>
      <div
        className={
          editMode
            ? "edit-grid absolute inset-0 z-0"
            : "no-edit-grid  absolute inset-0 z-0"
        }
      />
      <button
        onClick={switchMode}
        className={
          editMode
            ? "opacity-90 rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex hover:opacity-100 duration-500"
            : "opacity-50 rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex hover:opacity-100 duration-500"
        }
      >
        <RiPencilFill
          className={
            editMode
              ? "text-slate-900 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              : "text-gray-700 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
          }
        />
      </button>
      <Space
        config={spaceConfig}
        isEditable={editMode}
        saveConfig={saveConfig}
      />
    </div>
  );
}

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Home>
      { page }
    </Home>
  )
}

export default Homebase;