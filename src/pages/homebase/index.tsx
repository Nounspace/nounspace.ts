import React, { useEffect } from "react";
import Space, { SpaceConfig } from "@/common/ui/templates/Space";
import { useState } from "react";
import {
  GridLayout,
  resizeDirections,
} from "@/fidgets/layout/Grid";
import { LayoutFidgetDetails } from "@/common/fidgets";
import { NextPageWithLayout } from "../_app";
import ThemeEditorOverlay from "@/common/ui/organisms/ThemeEditorOverlay"
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import Navigation from "@/common/ui/organisms/Navigation";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

const Homebase: NextPageWithLayout = () => {
  const [editMode, setMode] = useState(false);
  const defaultLayoutData = [
    {
      i: "text1",
      resizeHandles: resizeDirections,
      x: 0,
      y: 0,
      w: 6,
      minW: 1,
      maxW: 12,
      h: 2,
      minH: 1,
      maxH: 12,
    },
    {
      i: "text2",
      resizeHandles: resizeDirections,
      x: 6,
      y: 0,
      w: 6,
      minW: 1,
      maxW: 12,
      h: 2,
      minH: 1,
      maxH: 12,
    },
    {
      i: "gallery",
      resizeHandles: resizeDirections,
      x: 0,
      y: 2,
      w: 8,
      minW: 1,
      maxW: 12,
      h: 7,
      minH: 1,
      maxH: 9,
    },
    {
      i: "frame",
      resizeHandles: resizeDirections,
      x: 8,
      y: 2,
      w: 4,
      minW: 2,
      maxW: 4,
      h: 6,
      minH: 3,
      maxH: 9,
    },
  ];

  const fidgets = {
    text1: {
      fidgetName: "text",
      id: "text1",
      instanceConfig: {
        settings: {
          title: "Hello, World!",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget tincidunt nunc. Vivamus vitae arcu placerat diam lacinia interdum."
        },
        editable: true,
      },
    },
    text2: {
      fidgetName: "text",
      id: "text2",
      instanceConfig: {
        settings: {
          title: "Text Fidget",
          text: "Jot down your ideas and grow them."
        },
        editable: true,
      },
    },
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

  const windowSize = useWindowSize()

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
    isBounded: true,
    margin: [30, 24],
    containerPadding: [0, 0],
  };
  const layoutID = "";
  const layoutDetails: LayoutFidgetDetails = {
    layoutConfig: gridDetails,
    layoutFidget: "grid",
  };

  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig>({
    layoutID,
    layoutDetails,
    theme: DEFAULT_THEME,
    fidgetConfigs: fidgets,
  });

  useEffect(() => {
    setSpaceConfig({
      ...spaceConfig,
      layoutDetails: {
        layoutFidget: "grid",
        layoutConfig: {
          ...gridDetails,
          rowHeight: windowSize ? Math.round(windowSize.height / 9) : 70,
        },
      },
    });
  }, [windowSize])

  async function saveConfig(config: SpaceConfig) {
    setSpaceConfig(config);
    return true;
  }

  return (
    <div>
      <div className="p-8">
        <div className="relative">
          <Space
            config={spaceConfig}
            isEditable={editMode}
            saveConfig={saveConfig}
          />
        </div>
      </div>
      <ThemeEditorOverlay editMode={editMode} setEditMode={setMode} />
    </div>
  );
}

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--user-theme-background)' }}>
    <div className="container mx-auto">
      <Navigation />
      <div className="p-4 sm:ml-64">
        { page }
      </div>
    </div>
    </div>
  )
}

export default Homebase;