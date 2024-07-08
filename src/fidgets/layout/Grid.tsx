import React, {
  DragEvent,
  useEffect,
  useMemo,
  useState,
  useCallback,
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
} from "@/common/fidgets";
import { CompleteFidgets } from "..";
import { createPortal } from "react-dom";
import EditorPanel from "@/common/components/organisms/EditorPanel";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { map, reject } from "lodash";
import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

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

const makeGridDetails = (hasProfile: boolean) => ({
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
  maxRows: hasProfile ? 8 : 10,
  rowHeight: 70,
  layout: [],
  margin: [16, 16],
  containerPadding: [16, 16],
});

type GridDetails = ReturnType<typeof makeGridDetails>;

type GridLayoutConfig = LayoutFidgetConfig<PlacedGridItem[]>;

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

const Portal = ({ children, container, show }) => {
  return show ? createPortal(children, container) : <></>;
};

const MemoizedPortal = React.memo(Portal);
const MemoizedEditorPanel = React.memo(EditorPanel);

const FlexibleGrid: typeof RGL = ({
  hasProfile,
  gridlines,
  gridDetails,
  ...otherProps
}) => {
  const ReactGridLayout = useMemo(() => WidthProvider(RGL), []);
  const { height } = useWindowSize();

  const { rowHeight, style } = useMemo(() => {
    // 64 = 4rem = magic number here is the height of the tabs bar above the grid
    // 160 = 10rem = magic number for the profile height
    const magicBase = hasProfile ? 64 + 160 : 64;
    const _rowHeight = height
      ? (height -
          magicBase -
          gridDetails.margin[0] * (gridDetails.maxRows - 1) -
          gridDetails.containerPadding[0] * 2) /
        gridDetails.maxRows
      : gridDetails.rowHeight;

    return {
      rowHeight: _rowHeight,
      style: { height: _rowHeight * gridDetails.maxRows + "px" },
    };
  }, [height, hasProfile, gridDetails]);

  return (
    <>
      {gridlines && <Gridlines {...gridDetails} rowHeight={rowHeight} />}
      <ReactGridLayout
        {...gridDetails}
        {...otherProps}
        rowHeight={rowHeight}
        className="grid-overlap"
        style={style}
      />
    </>
  );
};

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

  const gridDetails = useMemo(() => makeGridDetails(hasProfile), [hasProfile]);

  const saveTrayContents = useCallback(
    async (newTrayData: typeof fidgetTrayContents) => {
      return await saveConfig({
        fidgetTrayContents: newTrayData,
      });
    },
    [saveConfig],
  );

  const saveFidgetInstanceDatums = useCallback(
    async (datums: typeof fidgetInstanceDatums) => {
      return await saveConfig({
        fidgetInstanceDatums: datums,
      });
    },
    [saveConfig],
  );

  const saveTheme = useCallback(
    async (newTheme: typeof theme) => {
      return await saveConfig({
        theme: newTheme,
      });
    },
    [saveConfig],
  );

  const saveLayout = useCallback(
    async (newLayout: PlacedGridItem[]) => {
      return await saveConfig({
        layoutConfig: {
          layout: newLayout,
        },
      });
    },
    [saveConfig],
  );

  const unselectFidget = useCallback(() => {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }, []);

  const openFidgetPicker = useCallback(() => {
    setIsPickingFidget(true);
    unselectFidget();
  }, [unselectFidget]);

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
  }

  function removeFidgetFromTray(fidgetId: string) {
    const newFidgetTrayContents = reject(
      fidgetTrayContents,
      (fidget) => fidget.id === fidgetId,
    );

    saveTrayContents(newFidgetTrayContents);
  }

  function moveFidgetFromGridToTray(fidgetId: string) {
    const newFidgetTrayContents = [
      ...fidgetTrayContents,
      fidgetInstanceDatums[fidgetId],
    ];
    saveTrayContents(newFidgetTrayContents);

    removeFidget(fidgetId);
  }

  const removeFidget = useCallback(
    (fidgetId: string) => {
      // New set of instances
      const newFidgetInstanceDatums = { ...fidgetInstanceDatums };
      delete newFidgetInstanceDatums[fidgetId];

      //Make new layout with item removed
      const newLayout = reject(layoutConfig.layout, (x) => x.i == fidgetId);

      // Clear editor panel
      unselectFidget();

      saveLayout(newLayout);
      saveFidgetInstanceDatums(newFidgetInstanceDatums);
    },
    [
      saveLayout,
      saveFidgetInstanceDatums,
      unselectFidget,
      fidgetInstanceDatums,
      layoutConfig,
    ],
  );

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

  console.log("Rendering Grid");

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

  return (
    <>
      <MemoizedPortal container={element} show={inEditMode && element}>
        <MemoizedEditorPanel
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
        />
      </MemoizedPortal>

      <div className="flex flex-col z-10">
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
          <FlexibleGrid
            gridDetails={gridDetails}
            hasProfile={hasProfile}
            gridlines={inEditMode}
            isDraggable={inEditMode}
            isResizable={inEditMode}
            resizeHandles={resizeDirections}
            layout={layoutConfig.layout}
            items={layoutConfig.layout.length}
            isDroppable={true}
            droppingItem={externalDraggedItem}
            onDrop={handleDrop}
            onLayoutChange={saveLayoutConditional}
          >
            {map(layoutConfig.layout, (gridItem: PlacedGridItem) => {
              const fidgetDatum = fidgetInstanceDatums[gridItem.i];
              const fidgetModule = fidgetDatum
                ? CompleteFidgets[fidgetDatum.fidgetType]
                : null;
              if (!fidgetModule) return null;

              return (
                <div key={gridItem.i}>
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
          </FlexibleGrid>
        </div>
      </div>
    </>
  );
};

export default Grid;
