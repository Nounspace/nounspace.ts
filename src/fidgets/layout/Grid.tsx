import React, { ReactNode } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
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

export interface GridLayout extends LayoutFidgetConfig {
  readonly cols: number;
  readonly maxRows: number;
  layout: PlacedGridItem[];
  items: number;
  isResizable: boolean;
  isDraggable: boolean;
  isBounded?: boolean;
  rowHeight: number;
  compactType?: string | null;
  preventCollision?: boolean;
  margin: [number, number];
  containerPadding: [number, number];
  onLayoutChange: (layout: PlacedGridItem[]) => unknown;
  onDrop: (layout: PlacedGridItem[], item: PlacedGridItem) => unknown;
}

export type GridArgs = LayoutFidgetProps & {
  layoutConfig: GridLayout;
  fidgets: {
    [key: string]: ReactNode;
  };
  inEditMode: boolean;
  selectedFidgetID: string;
};

const ReactGridLayout = WidthProvider(RGL);

const Gridlines: React.FC<GridLayout> = ({
  maxRows,
  cols,
  rowHeight,
  margin,
  containerPadding,
}) => {
  return (
    <div
      className="absolute inset-0 rounded-lg h-max w-9/12 ml-auto"
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
  selectedFidgetID,
}: GridArgs) => {
  return (
    <>
      {inEditMode && <Gridlines {...layoutConfig} />}
      <ReactGridLayout
        {...layoutConfig}
        isDraggable={inEditMode}
        isResizable={inEditMode}
      >
        {layoutConfig.layout.map((gridItem: PlacedGridItem) => {
          return <div key={gridItem.i}>{fidgets[gridItem.i]}</div>;
        })}
      </ReactGridLayout>
    </>
  );
};

export default Grid;
