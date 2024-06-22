import React, { DragEvent, ReactNode, useEffect, useState } from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import RGL, { WidthProvider, DragOverEvent } from "react-grid-layout";
import {
  LayoutFidgetConfig,
  LayoutFidget,
  LayoutFidgetProps,
} from "@/common/fidgets";

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
  isDraggable: false,
  isResizable: false,
  isDroppable: true,
  isBounded: false,
  // This turns off compaction so you can place items wherever.
  compactType: null,
  // This turns off rearrangement so items will not be pushed arround.
  preventCollision: true,
  items: 4,
  cols: 12,
  maxRows: 9,
  rowHeight: 70,
  layout: [],
  margin: [16, 16],
  containerPadding: [0, 0],
  //onLayoutChange: (layout: PlacedGridItem[]) => unknown,
  onDrop: handleDrop,
  //droppingItem?: { i: string; w: number; h: number },
};

type GridDetails = typeof gridDetails;

type GridLayout = {
  layout: PlacedGridItem[];
};

export type GridArgs = LayoutFidgetProps & {
  layoutConfig: GridLayout;
  fidgets: {
    [key: string]: ReactNode;
  };
  inEditMode: boolean;
};

function handleDrop(
  layout: LayoutFidgetConfig,
  item: PlacedGridItem,
  e: DragEvent<HTMLDivElement>,
) {
  const data = JSON.parse(e.dataTransfer.getData("text/plain"));

  const newItem = {
    i: `0`,
    x: 0,
    y: 0,
    w: data.width, // Use the passed width
    h: data.height, // Use the passed height
    minW: data.width,
    maxW: data.width,
    minH: data.height,
    maxH: data.height,
  };

  //setExternalDraggedItem({ w: newItem.w, h: newItem.h });
}

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
      className="absolute inset-0 rounded-lg h-max w-8/12 ml-auto"
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

const Grid: LayoutFidget<GridArgs> = ({
  layoutConfig,
  fidgets,
  inEditMode,
}: GridArgs) => {
  var windowSize = useWindowSize();
  var rowHeight = 70;

  useEffect(() => {
    rowHeight = windowSize ? Math.round(windowSize.height / 9) - 16 - 8 : 70;
  });

  return (
    <>
      {inEditMode && <Gridlines {...gridDetails} />}
      <ReactGridLayout
        {...gridDetails}
        isDraggable={inEditMode}
        isResizable={inEditMode}
        rowheight={rowHeight}
      >
        {layoutConfig.layout.map((gridItem: PlacedGridItem) => {
          return <div key={gridItem.i}>{fidgets[gridItem.i]}</div>;
        })}
      </ReactGridLayout>
    </>
  );
};

export default Grid;
