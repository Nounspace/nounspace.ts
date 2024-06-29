import React, { DragEvent, useEffect, useMemo, useState } from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  LayoutFidget,
  FidgetInstanceData,
  FidgetConfig,
  FidgetSettings,
  LayoutFidgetSavableConfig,
  LayoutFidgetProps,
  LayoutFidgetConfig,
} from "@/common/fidgets";
import { CompleteFidgets } from "..";
import { createPortal } from "react-dom";
import EditorPanel from "@/common/components/organisms/EditorPanel";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { debounce, isUndefined, map } from "lodash";
import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";

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
  maxRows: 10,
  rowHeight: 70,
  layout: [],
  margin: [16, 16],
  containerPadding: [16, 16],
};

type GridDetails = typeof gridDetails;

type GridLayoutConfig = LayoutFidgetConfig<PlacedGridItem[]>;

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
      className="relative grid-overlap w-full h-full opacity-50"
      style={{
        transition: "background-color 1000ms linear",
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${maxRows}, ${rowHeight}px)`,
        gridGap: `${margin[0]}px`,
        rowGap: `${margin[1]}px`,
        padding: `${containerPadding[0]}px`,
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

type GridLayoutProps = LayoutFidgetProps<GridLayoutConfig>;

const Grid: LayoutFidget<GridLayoutProps> = ({
  fidgetInstanceDatums,
  fidgetTrayContents,
  layoutConfig,
  theme,
  saveConfig,
  inEditMode,
  saveExitEditMode,
  cancelExitEditMode,
  portalRef,
}) => {
  // State to handle selecting, dragging, and Grid edit functionality
  const [element, setElement] = useState<HTMLDivElement | null>(
    portalRef.current,
  );
  useEffect(() => {
    setElement(portalRef.current);
  }, []);
  const [externalDraggedItem, setExternalDraggedItem] = useState<{
    i: string;
    w: number;
    h: number;
  }>();
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentlyDragging, setCurrentlyDragging] = useState(false);
  const [currentFidgetSettings, setCurrentFidgetSettings] =
    useState<React.ReactNode>(<></>);
  const [isPickingFidget, setIsPickingFidget] = useState(false);

  // State to create a mutable local copy of the config
  const [localFidgetInstanceDatums, setLocalFidgetInstanceDatums] =
    useState(fidgetInstanceDatums);
  const [localFidgetTrayContents, setLocalFidgetTrayContents] =
    useState(fidgetTrayContents);
  const [localLayout, setLocalLayout] = useState(layoutConfig.layout);
  const [localTheme, setLocalTheme] = useState(theme);

  const saveCurrentConfig = debounce(() => {
    const newConfig: LayoutFidgetSavableConfig<GridLayoutConfig> = {
      fidgetInstanceDatums: localFidgetInstanceDatums,
      fidgetTrayContents: localFidgetTrayContents,
      theme: localTheme,
      layoutConfig: {
        layout: localLayout,
      },
    };
    return saveConfig(newConfig);
  }, 1000);

  async function saveTrayContents(newTrayData: typeof fidgetTrayContents) {
    setLocalFidgetTrayContents(newTrayData);
    await saveCurrentConfig();
  }

  async function saveFidgetInstanceDatums(datums: typeof fidgetInstanceDatums) {
    setLocalFidgetInstanceDatums(datums);
    await saveCurrentConfig();
  }

  async function saveTheme(newTheme: typeof theme) {
    setLocalTheme(newTheme);
    await saveCurrentConfig();
  }

  async function saveLayout(newLayout: PlacedGridItem[]) {
    setLocalLayout(newLayout);
    await saveCurrentConfig();
  }

  function unselectFidget() {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselectFidget();
  }

  const { height } = useWindowSize();
  const rowHeight = useMemo(
    () =>
      height
        ? Math.round(
            // The 64 magic number here is the height of the tabs bar above the grid
            (height -
              48 -
              gridDetails.margin[0] * gridDetails.maxRows -
              gridDetails.containerPadding[0] * 2) /
              gridDetails.maxRows,
          )
        : 70,
    [height],
  );

  function handleDrop(
    _layout: PlacedGridItem[],
    item: PlacedGridItem,
    e: DragEvent<HTMLDivElement>,
  ) {
    setCurrentlyDragging(false);

    const fidgetData: FidgetInstanceData = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );

    saveFidgetInstanceDatums({
      ...fidgetInstanceDatums,
      [fidgetData.id]: fidgetData,
    });

    const newItem: PlacedGridItem = {
      i: fidgetData.id,

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

    saveLayout([...localLayout, newItem]);
    moveFidgetFromTrayToGrid(newItem);
  }

  function moveFidgetFromTrayToGrid(gridItem: PlacedGridItem) {
    const newLayout = [...localLayout, gridItem];

    const itemTrayIndex = fidgetTrayContents.findIndex(
      (x) => x.id == gridItem.i,
    );
    const newFidgetTrayContents = fidgetTrayContents
      .slice(0, itemTrayIndex)
      .concat(fidgetTrayContents.slice(itemTrayIndex + 1));

    saveTrayContents(newFidgetTrayContents);
    saveLayoutConditional(newLayout);
  }

  function moveFidgetFromGridToTray(fidgetId: string) {
    const newFidgetTrayContents = [
      ...fidgetTrayContents,
      fidgetInstanceDatums[fidgetId],
    ];
    saveTrayContents(newFidgetTrayContents);

    removeFidget(fidgetId);
  }

  function removeFidget(fidgetId: string) {
    // New set of instances
    const newFidgetInstanceDatums = { ...localFidgetInstanceDatums };
    delete newFidgetInstanceDatums[fidgetId];

    // Find fidget index
    const itemLayoutIndex = layoutConfig.layout.findIndex(
      (x) => x.i == fidgetId,
    );

    //Make new layout with item removed
    const newLayoutConfig: GridLayoutConfig = {
      layout: localLayout
        .slice(0, itemLayoutIndex)
        .concat(localLayout.slice(itemLayoutIndex + 1)),
    };

    // Clear editor panel
    unselectFidget();

    saveLayoutConditional(newLayoutConfig.layout);
    saveFidgetInstanceDatums(newFidgetInstanceDatums);
  }

  function saveLayoutConditional(newLayout: PlacedGridItem[]) {
    if (!currentlyDragging && inEditMode) {
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
                saveExitEditMode={saveExitEditMode}
                cancelExitEditMode={cancelExitEditMode}
                theme={localTheme}
                saveTheme={saveTheme}
                unselect={unselectFidget}
                selectedFidgetID={selectedFidgetID}
                currentFidgetSettings={currentFidgetSettings}
                setExternalDraggedItem={setExternalDraggedItem}
                fidgetTrayContents={localFidgetTrayContents}
                fidgetInstanceDatums={localFidgetInstanceDatums}
                saveFidgetInstanceDatums={saveFidgetInstanceDatums}
                saveTrayContents={saveTrayContents}
                removeFidget={removeFidget}
                isPickingFidget={isPickingFidget}
                setIsPickingFidget={setIsPickingFidget}
                openFidgetPicker={openFidgetPicker}
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
      {editorPanelPortal(element)}

      <div className="flex flex-col">
        <div
          className={
            inEditMode
              ? "bg-[#c8e3f84d] flex-row justify-center h-16"
              : "flex-row justify-center h-16"
          }
        >
          {inEditMode ? (
            <button
              onClick={openFidgetPicker}
              className="flex float-right rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
            >
              <AddFidgetIcon />
              <span className="ml-2">Fidget</span>
            </button>
          ) : null}
        </div>

        <div className="flex-1 grid-container grow">
          {inEditMode && <Gridlines {...gridDetails} rowHeight={rowHeight} />}

          <ReactGridLayout
            {...gridDetails}
            isDraggable={inEditMode}
            isResizable={inEditMode}
            resizeHandles={resizeDirections}
            layout={localLayout}
            items={localLayout.length}
            rowHeight={rowHeight}
            isDroppable={true}
            droppingItem={externalDraggedItem}
            onDrop={handleDrop}
            onLayoutChange={saveLayoutConditional}
            className={"grid-overlap"}
            style={{ height: height + "px)" }}
          >
            {map(localLayout, (gridItem: PlacedGridItem) => {
              const fidgetDatum = localFidgetInstanceDatums[gridItem.i];
              if (isUndefined(fidgetDatum)) return null;
              return (
                <div key={gridItem.i}>
                  <FidgetWrapper
                    {...{
                      fidget: CompleteFidgets[fidgetDatum.fidgetType].fidget,
                      bundle: {
                        fidgetType: fidgetDatum.fidgetType,
                        id: fidgetDatum.id,
                        config: {
                          // TODO: Determine what this editable variable is being used for
                          editable: inEditMode,
                          settings: fidgetDatum.config.settings,
                          data: fidgetDatum.config.data,
                        },
                        properties:
                          CompleteFidgets[fidgetDatum.fidgetType].properties,
                      },
                      context: {
                        theme: theme,
                      },
                      removeFidget: removeFidget,
                      minimizeFidget: moveFidgetFromGridToTray,
                      saveConfig: async (
                        newInstanceConfig: FidgetConfig<FidgetSettings>,
                      ) => {
                        return await saveFidgetInstanceDatums({
                          ...localFidgetInstanceDatums,
                          [fidgetDatum.id]: {
                            config: newInstanceConfig,
                            fidgetType: fidgetDatum.fidgetType,
                            id: fidgetDatum.id,
                          },
                        });
                      },
                      setCurrentFidgetSettings,
                      setSelectedFidgetID,
                      selectedFidgetID,
                    }}
                  />
                </div>
              );
            })}
          </ReactGridLayout>
        </div>
      </div>
    </>
  );
};

export default Grid;
