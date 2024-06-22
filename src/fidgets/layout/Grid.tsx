import React, {
  DragEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import RGL, { WidthProvider, DragOverEvent } from "react-grid-layout";
import {
  LayoutFidgetConfig,
  LayoutFidget,
  LayoutFidgetProps,
  FidgetInstanceData,
} from "@/common/fidgets";
import { CompleteFidgets } from "..";

export const resizeDirections = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
export type ResizeDirection = (typeof resizeDirections)[number];

interface GridItem {
  i: string; // Id
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  // By default, a handle is only shown on the bottom-right (southeast) corner.
  // As of RGL >= 1.4.0, resizing on any corner works just fine!
  resizeHandles?: ResizeDirection[];
}

export interface PlacedGridItem extends GridItem {
  // These are all in grid units, not pixels
  x: number;
  y: number;
  w: number;
  h: number;
  // If false, will not be draggable. Overrides `static`.
  isDraggable?: boolean;
  // If false, will not be resizable. Overrides `static`.
  isResizable?: boolean;
  // If true and draggable, item will be moved only within grid.
  isBounded?: boolean;
}

const gridDetails = {
  items: 0,
  isDraggable: false,
  isResizable: false,
  isDroppable: true,
  isBounded: false,
  // This turns off compaction so you can place items wherever.
  compactType: null,
  // This turns off rearrangement so items will not be pushed arround.
  preventCollision: true,
  cols: 12,
  maxRows: 9,
  rowHeight: 70,
  layout: [],
  margin: [16, 16],
  containerPadding: [0, 0],
};

type GridDetails = typeof gridDetails;

type GridLayoutConfig = {
  layout: PlacedGridItem[];
};

const ReactGridLayout = WidthProvider(RGL);

const Gridlines: React.FC<GridDetails> = ({
  maxRows,
  cols,
  rowHeight,
  margin,
  containerPadding,
}) => {
  return (
    <div
      className="absolute p-8 inset-8 rounded-lg h-max w-8/12 ml-auto"
      style={{
        transition: "background-color 1000ms linear",
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${maxRows}, ${rowHeight}px)`,
        gridGap: `${margin[0]}px`,
        rowGap: `${margin[1]}px`,
        inset: `${containerPadding[0]}px ${containerPadding[1]}px`,
        background: "rgba(200, 227, 248, 0.3)",
      }}
    >
      {[...Array(cols * maxRows)].map((_, i) => (
        <div
          className="rounded-lg"
          key={i}
          style={{
            backgroundColor: "rgba(200, 227, 248, 0.5)",
            outline: "1px dashed rgba(200, 227, 248, 0.8)",
          }}
        />
      ))}
    </div>
  );
};

interface GridArgs {
  layoutConfig: GridLayoutConfig;
  fidgets: {
    [key: string]: ReactNode;
  };
  inEditMode: boolean;
  saveLayout: (newLayoutConfig: LayoutFidgetConfig) => Promise<void>;
  addFidget: (key: string, fidgetData: FidgetInstanceData) => Promise<void>;
  droppingItem: {
    i: "";
    w: 1;
    h: 1;
  };
}

const Grid: LayoutFidget<GridArgs> = ({
  layoutConfig,
  fidgets,
  inEditMode,
  saveLayout,
  addFidget,
  droppingItem,
}: GridArgs) => {
  const windowSize = useWindowSize();
  const rowHeight = useMemo(() => {
    windowSize
      ? Math.round(windowSize.height / gridDetails.maxRows) -
        gridDetails.margin[0]
      : 70;
  }, [windowSize]);

  function handleDrop(
    layout: PlacedGridItem[],
    item: PlacedGridItem,
    e: DragEvent<HTMLDivElement>,
    saveGrid?: () => {},
  ) {
    const fidgetData: FidgetInstanceData = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );

    const newItem = {
      i: fidgetData.id,

      x: 0,
      y: 0,

      w: CompleteFidgets[fidgetData.fidgetType].properties.size.minWidth,
      minW: CompleteFidgets[fidgetData.fidgetType].properties.size.minWidth,
      maxW: CompleteFidgets[fidgetData.fidgetType].properties.size.maxWidth,

      h: CompleteFidgets[fidgetData.fidgetType].properties.size.minHeight,
      minH: CompleteFidgets[fidgetData.fidgetType].properties.size.minWidth,
      maxH: CompleteFidgets[fidgetData.fidgetType].properties.size.maxWidth,

      resizeHandles: resizeDirections,
      isDraggable: true,
      isResizable: true,
    };

    const newLayoutConfig: GridLayoutConfig = {
      ...layoutConfig,
      layout: [...layoutConfig.layout, newItem],
    };

    addFidget(fidgetData.id, fidgetData);
    saveLayout(newLayoutConfig);
  }

  return (
    <>
      {inEditMode && <Gridlines {...gridDetails} />}
      <ReactGridLayout
        {...gridDetails}
        isDraggable={inEditMode}
        isResizable={inEditMode}
        layout={layoutConfig.layout}
        items={layoutConfig.layout.length}
        rowheight={rowHeight}
        isDroppable={true}
        droppingItem={droppingItem}
        onDrop={handleDrop}
        onLayoutChange={saveLayout}
        className="h-full"
      >
        {layoutConfig.layout.map((gridItem: PlacedGridItem) => {
          return <div key={gridItem.i}>{fidgets[gridItem.i]}</div>;
        })}
      </ReactGridLayout>
    </>
  );
};

export default Grid;
