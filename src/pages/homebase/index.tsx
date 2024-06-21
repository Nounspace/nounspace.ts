import React, { useEffect, DragEvent } from "react";
import Space, { SpaceConfig } from "@/common/components/templates/Space";
import { useState } from "react";
import { GridLayout, resizeDirections } from "@/fidgets/layout/Grid";
import { LayoutFidgetDetails } from "@/common/fidgets";
import { NextPageWithLayout } from "../_app";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

const Homebase: NextPageWithLayout = () => {
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
      fidgetType: "text",
      id: "text1",
      config: {
        editable: true,
        settings: {
          title: "Hello, World!",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget tincidunt nunc. Vivamus vitae arcu placerat diam lacinia interdum.",
        },
        data: {},
      },
    },
    text2: {
      fidgetType: "text",
      id: "text2",
      config: {
        editable: true,
        settings: {
          title: "Text Fidget",
          text: "Jot down your ideas and grow them.",
        },
        data: {},
      },
    },
    gallery: {
      fidgetType: "gallery",
      id: "gallery",
      config: {
        editable: false,
        settings: {
          imageUrl:
            "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
        },
        data: {},
      },
    },
    frame: {
      fidgetType: "frame",
      id: "frame",
      config: {
        editable: false,
        settings: {
          url: "https://altumbase.com/degen/4888/dIVWKaIQZR",
        },
        data: {},
      },
    },
  };

  const fidgetsInTray = [
    {
      fidgetType: "text",
      id: "text3",
      config: {
        editable: true,
        settings: {
          title: "Hello, World!",
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget tincidunt nunc. Vivamus vitae arcu placerat diam lacinia interdum.",
        },
        data: {},
      },
    },
    {
      fidgetType: "gallery",
      id: "gallery2",
      config: {
        editable: false,
        settings: {
          imageUrl:
            "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
        },
        data: {},
      },
    },
    {
      fidgetType: "frame",
      id: "frame2",
      config: {
        editable: false,
        settings: {
          url: "https://altumbase.com/degen/4888/dIVWKaIQZR",
        },
        data: {},
      },
    },
  ];

  const windowSize = useWindowSize();

  const gridDetails: GridLayout = {
    isDroppable: true,
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
    isBounded: false,
    margin: [16, 16],
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
    fidgetInstances: fidgets,
    isEditable: true,
    fidgetTrayContents: fidgetsInTray,
  });

  useEffect(() => {
    setSpaceConfig({
      ...spaceConfig,
      layoutDetails: {
        layoutFidget: "grid",
        layoutConfig: {
          ...gridDetails,
          rowHeight: windowSize
            ? Math.round(windowSize.height / gridDetails.maxRows) -
              gridDetails.margin[0] -
              8
            : 70,
        },
      },
    });
  }, [windowSize]);

  async function saveConfig(config: SpaceConfig) {
    setSpaceConfig(config);
  }

  return (
    <div>
      <div className="p-8">
        <div className="relative">
          <Space config={spaceConfig} saveConfig={saveConfig} />
        </div>
      </div>
    </div>
  );
};

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div
      className="min-h-screen max-w-screen"
      style={{ background: "var(--user-theme-background)" }}
    >
      {page}
    </div>
  );
};

export default Homebase;
