import React, {
  Dispatch,
  DragEvent,
  ReactNode,
  SetStateAction,
  useEffect,
  useLayoutEffect,
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
  FidgetConfig,
  FidgetSettings,
} from "@/common/fidgets";
import { CompleteFidgets } from "..";
import { createPortal } from "react-dom";
import EditorPanel from "@/common/components/organisms/EditorPanel";
import { ThemeSettings } from "@/common/lib/theme";
import { SpaceConfig } from "@/common/components/templates/Space";
import { mapValues } from "lodash";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";

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
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  fidgetTrayContents: FidgetInstanceData[];
  theme: ThemeSettings;

  saveLayout(layout: LayoutFidgetConfig): Promise<void>;
  saveFidgets(
    newLayoutConfig: LayoutFidgetConfig,
    newFidgetInstanceDatums: {
      [key: string]: FidgetInstanceData;
    },
  ): Promise<void>;
  saveFidgetInstanceDatums(newFidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  }): Promise<void>;
  saveTrayContents(fidgetTrayContents: FidgetInstanceData[]): Promise<void>;
  saveTheme(newTheme: any): Promise<void>;

  inEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
}

const Grid: LayoutFidget<GridArgs> = ({
  layoutConfig,
  fidgetInstanceDatums,
  fidgetTrayContents,
  theme,
  saveLayout,
  saveFidgets,
  saveFidgetInstanceDatums,
  saveTrayContents,
  saveTheme,
  inEditMode,
  setEditMode,
  portalRef,
}: GridArgs) => {
  const [externalDraggedItem, setExternalDraggedItem] = useState<{
    i: string;
    w: number;
    h: number;
  }>();
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentFidgetSettings, setcurrentFidgetSettings] =
    useState<React.ReactNode>(<></>);

  function unselectFidget() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }
  const [element, setElement] = useState<HTMLDivElement | null>(
    portalRef.current,
  );
  const windowSize = useWindowSize();

  const rowHeight = useMemo(() => {
    windowSize
      ? Math.round(windowSize.height / gridDetails.maxRows) -
        gridDetails.margin[0]
      : 70;
  }, [windowSize]);

  useEffect(() => {
    // Force a rerender, so it can be passed to the child.
    // If this causes an unwanted flicker, use useLayoutEffect instead
    setElement(portalRef.current);
  }, []);

  function editorPanelPortal(portalNode: HTMLDivElement | null) {
    return (
      <>
        {inEditMode ? (
          portalNode ? (
            createPortal(
              <EditorPanel
                setEditMode={setEditMode}
                theme={theme}
                saveTheme={saveTheme}
                unselect={unselectFidget}
                selectedFidgetID={selectedFidgetID}
                currentFidgetSettings={currentFidgetSettings}
                setExternalDraggedItem={setExternalDraggedItem}
                fidgetTrayContents={fidgetTrayContents}
                fidgetInstanceDatums={fidgetInstanceDatums}
                saveFidgetInstanceDatums={saveFidgetInstanceDatums}
                saveTrayContents={saveTrayContents}
              />,
              portalNode,
            )
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
      </>
    );
  }

  function handleDrop(
    layout: PlacedGridItem[],
    item: PlacedGridItem,
    e: DragEvent<HTMLDivElement>,
  ) {
    console.log("Dropped: ", item, "Onto: ", layout);
    const fidgetData: FidgetInstanceData = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );

    const newItem = {
      i: item.i,

      x: item.x,
      y: item.y,

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
      layout: [...layoutConfig.layout],
    };

    const itemIndex = newLayoutConfig.layout.findIndex((x) => x.i == item.i);
    newLayoutConfig.layout[itemIndex] = newItem;

    const newFidgetInstanceDatums: { [key: string]: FidgetInstanceData } = {
      ...fidgetInstanceDatums,
      [fidgetData.id]: fidgetData,
    };

    saveFidgets(newLayoutConfig, newFidgetInstanceDatums);
  }

  return (
    <>
      {/* <div
        className="fixed top-0 left-0 h-screen w-screen bg-transparent"
        onClick={unselectFidget}
      ></div> */}

      {editorPanelPortal(element)}

      {inEditMode && <Gridlines {...gridDetails} />}

      <ReactGridLayout
        {...gridDetails}
        isDraggable={inEditMode}
        isResizable={inEditMode}
        layout={layoutConfig.layout}
        items={layoutConfig.layout.length}
        rowheight={rowHeight}
        isDroppable={true}
        droppingItem={externalDraggedItem}
        onDrop={handleDrop}
        onLayoutChange={saveLayout}
        className="h-full"
      >
        {layoutConfig.layout.map((gridItem: PlacedGridItem) => {
          console.log("Layout Config", layoutConfig);
          console.log("Fidget Instances", fidgetInstanceDatums);
          console.log("Grid Item", gridItem.i);
          console.log("Specific Instance", fidgetInstanceDatums[gridItem.i]);
          return (
            <div key={gridItem.i}>
              {FidgetWrapper({
                fidget:
                  CompleteFidgets[fidgetInstanceDatums[gridItem.i].fidgetType]
                    .fidget,
                bundle: {
                  fidgetType: fidgetInstanceDatums[gridItem.i].fidgetType,
                  id: fidgetInstanceDatums[gridItem.i].id,
                  config: {
                    editable: inEditMode,
                    settings: fidgetInstanceDatums[gridItem.i].config.settings,
                    data: fidgetInstanceDatums[gridItem.i].config.data,
                  },
                  properties:
                    CompleteFidgets[fidgetInstanceDatums[gridItem.i].fidgetType]
                      .properties,
                },
                context: {
                  theme: theme,
                },
                saveConfig: async (
                  newInstanceConfig: FidgetConfig<FidgetSettings>,
                ) => {
                  return await saveFidgetInstanceDatums(
                    (fidgetInstanceDatums = {
                      ...fidgetInstanceDatums,
                      [fidgetInstanceDatums[gridItem.i].id]: {
                        config: newInstanceConfig,
                        fidgetType: fidgetInstanceDatums[gridItem.i].fidgetType,
                        id: fidgetInstanceDatums[gridItem.i].id,
                      },
                    }),
                  );
                },
                setcurrentFidgetSettings: setcurrentFidgetSettings,
                setSelectedFidgetID: setSelectedFidgetID,
                selectedFidgetID: selectedFidgetID,
              })}
            </div>
          );
        })}
      </ReactGridLayout>
    </>
  );
};

export default Grid;
