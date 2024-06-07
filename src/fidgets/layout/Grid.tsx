import React, { ReactNode } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import _ from "lodash";
import { FidgetDetails, LayoutFidgetConfig, LayoutFiget, LayoutFigetProps } from "@/common/fidgets";
import randDivId from "@/common/lib/utils/divIdGenerator";

export type ResizeDirections = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';

interface GridItem {
  i: string; // Id
  minW: number,
  maxW: number,
  minH: number,
  maxH: number,
  // By default, a handle is only shown on the bottom-right (southeast) corner.
  // As of RGL >= 1.4.0, resizing on any corner works just fine!
  resizeHandles?: ResizeDirections[];
}

export interface PlacedGridItem extends GridItem{
  // These are all in grid units, not pixels
  x: number,
  y: number,
  w: number,
  h: number,
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
  margin?: [number, number];
  onLayoutChange: (layout: PlacedGridItem[]) => unknown;
  onDrop: (layout: PlacedGridItem[], item: PlacedGridItem) => unknown;
}

export type GridArgs = LayoutFigetProps & {
  layoutConfig: GridLayout;
  fidgets: {
    [key: string]: ReactNode;
  };
  isEditable: boolean;
}

const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"] as ResizeDirections[];

export function createGridItemFromFidgetDetails(details: FidgetDetails): GridItem {
  return {
    i: details.id + randDivId(),
    maxH: details.editConfig.size.maxHeight,
    maxW: details.editConfig.size.maxWidth,
    minH: details.editConfig.size.minHeight,
    minW: details.editConfig.size.minWidth,
    resizeHandles: availableHandles,
  };
}

const ReactGridLayout = WidthProvider(RGL);

const Grid: LayoutFiget<GridArgs> = ({ layoutConfig, fidgets, isEditable }: GridArgs) => {
  const layoutConfigWithEditable: GridLayout = {
    ...layoutConfig,
    isDraggable: isEditable,
    isResizable: isEditable,
  };

  function generateDOM() {
    return _.map(layoutConfigWithEditable.layout, (gridItem: PlacedGridItem) => {
      return (
        <div key={gridItem.i}>
          { fidgets[gridItem.i] }
        </div>
      );
    });
  }

  return (
    <ReactGridLayout {...layoutConfigWithEditable}>
      { generateDOM() }
    </ReactGridLayout>
  );
}

export default Grid;