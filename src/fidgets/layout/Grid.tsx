import React, { DragEvent, useEffect, useState } from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  LayoutFidgetConfig,
  LayoutFidget,
  FidgetInstanceData,
  FidgetConfig,
  FidgetSettings,
} from "@/common/fidgets";
import { CompleteFidgets } from "..";
import { createPortal } from "react-dom";
import EditorPanel from "@/common/components/organisms/EditorPanel";
import { ThemeSettings } from "@/common/lib/theme";
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
  const [currentlyDragging, setCurrentlyDragging] = useState(false);
  const [currentFidgetSettings, setcurrentFidgetSettings] =
    useState<React.ReactNode>(<></>);

  function unselectFidget() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }
  const [element, setElement] = useState<HTMLDivElement | null>(
    portalRef.current,
  );

  const { height } = useWindowSize();

  const rowHeight = height
    ? Math.round((height - 200) / gridDetails.maxRows)
    : 70;

  useEffect(() => {
    // Force a rerender, so it can be passed to the child.
    // If this causes an unwanted flicker, use useLayoutEffect instead
    setElement(portalRef.current);
  }, []);

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
      minH: CompleteFidgets[fidgetData.fidgetType].properties.size.minHeight,
      maxH: CompleteFidgets[fidgetData.fidgetType].properties.size.maxHeight,

      resizeHandles: resizeDirections,
    };

    setCurrentlyDragging(false);
    moveFidgetFromTrayToGrid(newItem, fidgetData);
  }

  function moveFidgetFromTrayToGrid(
    gridItem: PlacedGridItem,
    fidgetData: FidgetInstanceData,
  ) {
    const newLayoutConfig: GridLayoutConfig = {
      layout: [...layoutConfig.layout],
    };

    const itemLayoutIndex = newLayoutConfig.layout.findIndex(
      (x) => x.i == gridItem.i,
    );
    newLayoutConfig.layout[itemLayoutIndex] = gridItem;

    const newFidgetInstanceDatums: { [key: string]: FidgetInstanceData } = {
      ...fidgetInstanceDatums,
      [fidgetData.id]: fidgetData,
    };

    const itemTrayIndex = fidgetTrayContents.findIndex(
      (x) => x.id == gridItem.i,
    );
    const newFidgetTrayContents = fidgetTrayContents.splice(itemTrayIndex, 1);

    saveTrayContents(newFidgetTrayContents);
    saveFidgets(newLayoutConfig, newFidgetInstanceDatums);
  }

  function removeFidgetFromGrid(fidgetId: string) {
    // Note that this function does not remove it from the list of instances (fidgetInstanceDatums

    const newLayoutConfig: GridLayoutConfig = {
      layout: [...layoutConfig.layout],
    };

    const itemLayoutIndex = newLayoutConfig.layout.findIndex(
      (x) => x.i == fidgetId,
    );
    newLayoutConfig.layout = newLayoutConfig.layout.splice(itemLayoutIndex, 1);

    saveFidgets(newLayoutConfig, fidgetInstanceDatums);
  }

  function saveLayoutConditional(newLayout: PlacedGridItem[]) {
    console.log("Layout Config", layoutConfig);
    if (currentlyDragging) {
      layoutConfig.layout = newLayout;
    } else {
      saveLayout(newLayout);
    }
  }

  function editorPanelPortal(portalNode: HTMLDivElement | null) {
    return (
      <>
        {inEditMode ? (
          portalNode ? (
            createPortal(
              <EditorPanel
                setCurrentlyDragging={setCurrentlyDragging}
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
                removeFidgetFromGrid={removeFidgetFromGrid}
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

  return (
    <>
      {/* <div
        className="fixed top-0 left-0 h-screen w-screen bg-transparent"
        onClick={unselectFidget}
      ></div> */}

      {editorPanelPortal(element)}

      {inEditMode && <Gridlines {...gridDetails} rowHeight={rowHeight} />}

      <ReactGridLayout
        {...gridDetails}
        isDraggable={inEditMode}
        isResizable={inEditMode}
        layout={layoutConfig.layout}
        items={layoutConfig.layout.length}
        rowHeight={rowHeight}
        isDroppable={true}
        droppingItem={externalDraggedItem}
        onDrop={handleDrop}
        onLayoutChange={saveLayoutConditional}
        className="h-full"
      >
        {layoutConfig.layout.map((gridItem: PlacedGridItem) => {
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
                    // TODO: Determine what this editable variable is being used for
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
                  saveLayout(layoutConfig.layout);
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
