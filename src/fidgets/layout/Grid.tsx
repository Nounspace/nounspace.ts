import React, {
  DragEvent,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import RGL, { WidthProvider } from "react-grid-layout";
import {
  LayoutFidget,
  FidgetInstanceData,
  FidgetConfig,
  FidgetSettings,
  LayoutFidgetProps,
  LayoutFidgetConfig,
  FidgetBundle,
} from "@/common/fidgets";
import { CompleteFidgets } from "..";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import EditorPanel from "@/common/components/organisms/EditorPanel";
import {
  FidgetWrapper,
  getSettingsWithDefaults,
} from "@/common/fidgets/FidgetWrapper";
import { map, reject } from "lodash";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import FidgetSettingsEditor from "@/common/components/organisms/FidgetSettingsEditor";

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

const makeGridDetails = (hasProfile: boolean, hasFeed: boolean) => ({
  items: 0,
  isDroppable: true,
  isBounded: false,
  // This turns off compaction so you can place items wherever.
  compactType: null,
  // This turns off rearrangement so items will not be pushed arround.
  preventCollision: true,
  cols: hasFeed ? 6 : 12,
  maxRows: hasProfile ? 8 : 10,
  rowHeight: 70,
  layout: [],
  margin: [16, 16],
  containerPadding: [16, 16],
});

type GridDetails = ReturnType<typeof makeGridDetails>;

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
        background: "rgba(200, 227, 248, 0.011)",
      }}
    >
      {[...Array(cols * maxRows)].map((_, i) => (
        <div
          className="rounded-lg"
          key={i}
          style={{
            backgroundColor: "rgba(200, 227, 248, 0.5)",
            outline: "2px dashed rgba(200, 227, 248, 0.3)",
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
  hasProfile,
  hasFeed,
  fid,
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

  const gridDetails = useMemo(
    () => makeGridDetails(hasProfile, hasFeed),
    [hasProfile, hasFeed],
  );

  const saveTrayContents = async (newTrayData: typeof fidgetTrayContents) => {
    return await saveConfig({
      fidgetTrayContents: newTrayData,
    });
  };

  const saveFidgetInstanceDatums = async (
    datums: typeof fidgetInstanceDatums,
  ) => {
    return await saveConfig({
      fidgetInstanceDatums: datums,
    });
  };

  const saveTheme = async (newTheme: typeof theme) => {
    return await saveConfig({
      theme: newTheme,
    });
  };

  const saveLayout = async (newLayout: PlacedGridItem[]) => {
    return await saveConfig({
      layoutConfig: {
        layout: newLayout,
      },
    });
  };

  const saveFidgetConfig = useCallback(
    (id: string) => async (newInstanceConfig: FidgetConfig<FidgetSettings>) => {
      return await saveFidgetInstanceDatums({
        ...fidgetInstanceDatums,
        [id]: {
          ...fidgetInstanceDatums[id],
          config: newInstanceConfig,
        },
      });
    },
    [fidgetInstanceDatums, saveFidgetInstanceDatums],
  );

  function unselectFidget() {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselectFidget();
  }

  function selectFidget(bundle: FidgetBundle) {
    const settingsWithDefaults = getSettingsWithDefaults(
      bundle.config.settings,
      bundle.properties,
    );
    const onSave = async (
      newSettings: FidgetSettings,
      shouldUnselect?: boolean,
    ) => {
      try {
        await saveFidgetConfig(bundle.id)({
          ...bundle.config,
          settings: newSettings,
        });
      } catch (e) {
        toast.error("Failed to save fidget settings", { duration: 1000 });
      }

      if (shouldUnselect) {
        unselectFidget();
      }
    };

    setSelectedFidgetID(bundle.id);
    setCurrentFidgetSettings(
      <FidgetSettingsEditor
        fidgetId={bundle.id}
        properties={bundle.properties}
        settings={settingsWithDefaults}
        onSave={onSave}
        unselect={unselectFidget}
        removeFidget={removeFidget}
      />,
    );
  }

  const { height } = useWindowSize();
  const rowHeight = useMemo(() => {
    // 64 = 4rem = magic number here is the height of the tabs bar above the grid
    // 160 = 10rem = magic number for the profile height
    const magicBase = hasProfile ? 64 + 160 : 64;
    return height
      ? (height -
          magicBase -
          gridDetails.margin[0] * (gridDetails.maxRows - 1) -
          gridDetails.containerPadding[0] * 2) /
          gridDetails.maxRows
      : gridDetails.rowHeight;
  }, [height, hasProfile]);

  function handleDrop(
    _layout: PlacedGridItem[],
    item: PlacedGridItem,
    e: DragEvent<HTMLDivElement>,
  ) {
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

    saveLayout([...layoutConfig.layout, newItem]);
    removeFidgetFromTray(fidgetData.id);
    analytics.track(AnalyticsEvent.ADD_FIDGET, {
      fidgetType: fidgetData.fidgetType,
    });
    setCurrentlyDragging(false);

    const fidgetBundle = {
      ...fidgetData,
      properties: CompleteFidgets[fidgetData.fidgetType].properties,
      config: { ...fidgetData.config, editable: true },
    };

    selectFidget(fidgetBundle);
  }

  function removeFidgetFromTray(fidgetId: string) {
    const newFidgetTrayContents = reject(
      fidgetTrayContents,
      (fidget) => fidget.id === fidgetId,
    );

    saveTrayContents(newFidgetTrayContents);
  }

  function removeFidgetFromGrid(fidgetId: string) {
    // New set of instances
    const newFidgetInstanceDatums = { ...fidgetInstanceDatums };
    delete newFidgetInstanceDatums[fidgetId];

    //Make new layout with item removed
    const newLayout = reject(layoutConfig.layout, (x) => x.i == fidgetId);

    // Clear editor panel
    unselectFidget();

    saveLayout(newLayout);
    saveFidgetInstanceDatums(newFidgetInstanceDatums);
  }

  function removeFidget(fidgetId: string) {
    removeFidgetFromGrid(fidgetId);
    removeFidgetFromTray(fidgetId);
  }

  function moveFidgetFromGridToTray(fidgetId: string) {
    const newFidgetTrayContents = [
      ...fidgetTrayContents,
      fidgetInstanceDatums[fidgetId],
    ];
    saveTrayContents(newFidgetTrayContents);
    removeFidgetFromGrid(fidgetId);
  }

  function saveLayoutConditional(newLayout: PlacedGridItem[]) {
    // We only use to move items on the grid
    // We only update if the same items exist
    // We aren't adding or removing an item
    // And we are in edit mode
    if (
      !currentlyDragging &&
      inEditMode &&
      newLayout.length === layoutConfig.layout.length
    ) {
      saveLayout(newLayout);
    }
  }

  /**
   * Adds a given fidget to the grid by finding the first available space based on its minimum size.
   * If no space is available, returns false. Otherwise, returns true.
   */
  const addFidgetToGrid = (fidget: FidgetBundle): boolean => {
    const { fidgetType, id } = fidget;
    const fidgetProps = CompleteFidgets[fidgetType].properties;
    const minW = fidgetProps.size.minWidth;
    const minH = fidgetProps.size.minHeight;

    const isSpaceAvailable = (
      x: number,
      y: number,
      w: number,
      h: number,
    ): boolean => {
      for (const item of layoutConfig.layout) {
        if (
          x < item.x + item.w &&
          x + w > item.x &&
          y < item.y + item.h &&
          y + h > item.y
        ) {
          return false;
        }
      }
      return true;
    };

    // Search for available space
    for (let x = 0; x <= gridDetails.cols - minW; x++) {
      for (let y = 0; y <= gridDetails.maxRows - minH; y++) {
        if (isSpaceAvailable(x, y, minW, minH)) {
          const newItem: PlacedGridItem = {
            i: id,
            x,
            y,
            w: minW,
            h: minH,
            minW,
            minH,
            maxW: fidgetProps.size.maxWidth,
            maxH: fidgetProps.size.maxHeight,
            resizeHandles: resizeDirections,
            isBounded: false,
          };

          saveFidgetInstanceDatums({ ...fidgetInstanceDatums, [id]: fidget });
          saveLayout([...layoutConfig.layout, newItem]);
          analytics.track(AnalyticsEvent.ADD_FIDGET, {
            fidgetType: fidget.fidgetType,
          });
          return true;
        }
      }
    }

    return false;
  };

  function editorPanelPortal(portalNode: HTMLDivElement | null) {
    return inEditMode && portalNode ? (
      createPortal(
        <EditorPanel
          setCurrentlyDragging={setCurrentlyDragging}
          saveExitEditMode={saveExitEditMode}
          cancelExitEditMode={cancelExitEditMode}
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
          removeFidget={removeFidget}
          isPickingFidget={isPickingFidget}
          setIsPickingFidget={setIsPickingFidget}
          openFidgetPicker={openFidgetPicker}
          selectFidget={selectFidget}
          addFidgetToGrid={addFidgetToGrid}
        />,
        portalNode,
      )
    ) : (
      <></>
    );
  }

  const [itemsVisible, setItemsVisible] = useState(false);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      setTimeout(() => setItemsVisible(true), 100);
    }
  }, []);

  return (
    <>
      {editorPanelPortal(element)}

      <div className="flex flex-col z-10">
        {inEditMode && (
          <button
            onClick={openFidgetPicker}
            className={
              hasProfile
                ? "z-infinity flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold absolute top-40 right-0"
                : "z-infinity flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold absolute top-0 right-0"
            }
          >
            <div className="ml-2 ">
              <AddFidgetIcon />
            </div>
            <span className="ml-4 mr-2">Fidget</span>
          </button>
        )}
        <div className="flex-1 grid-container grow">
          {inEditMode && <Gridlines {...gridDetails} rowHeight={rowHeight} />}

          <ReactGridLayout
            {...gridDetails}
            isDraggable={inEditMode}
            isResizable={inEditMode}
            resizeHandles={resizeDirections}
            layout={layoutConfig.layout}
            items={layoutConfig.layout.length}
            rowHeight={rowHeight}
            isDroppable={true}
            droppingItem={externalDraggedItem}
            onDrop={handleDrop}
            onLayoutChange={saveLayoutConditional}
            className={`grid-overlap ${itemsVisible ? "items-visible" : ""}`}
            style={{
              height: rowHeight * gridDetails.maxRows + "px",
              // Add transition for opacity
              transition: "opacity 0.2s ease-in",
              opacity: itemsVisible ? 1 : 0,
            }}
          >
            {map(layoutConfig.layout, (gridItem: PlacedGridItem) => {
              const fidgetDatum = fidgetInstanceDatums[gridItem.i];
              const fidgetModule = fidgetDatum
                ? CompleteFidgets[fidgetDatum.fidgetType]
                : null;
              if (!fidgetModule) return null;

              return (
                <div
                  key={gridItem.i}
                  className={`grid-item ${
                    selectedFidgetID === gridItem.i
                      ? "outline outline-4 outline-offset-1 rounded-2xl outline-sky-600"
                      : ""
                  }`}
                >
                  <FidgetWrapper
                    fidget={fidgetModule.fidget}
                    context={{ theme }}
                    removeFidget={removeFidget}
                    minimizeFidget={moveFidgetFromGridToTray}
                    saveConfig={saveFidgetConfig(fidgetDatum.id)}
                    setCurrentFidgetSettings={setCurrentFidgetSettings}
                    setSelectedFidgetID={setSelectedFidgetID}
                    selectedFidgetID={selectedFidgetID}
                    bundle={{
                      ...fidgetDatum,
                      properties: fidgetModule.properties,
                      config: { ...fidgetDatum.config, editable: inEditMode },
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
