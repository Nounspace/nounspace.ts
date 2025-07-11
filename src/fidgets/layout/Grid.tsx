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
import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import FidgetSettingsEditor from "@/common/components/organisms/FidgetSettingsEditor";
import { debounce } from "lodash";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { analytics } from "@/common/providers/AnalyticsProvider";
import { SpaceConfig } from "../../app/(spaces)/Space";
import { defaultUserTheme } from "@/common/lib/theme/defaultTheme";
import { v4 as uuidv4 } from "uuid";

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

const makeGridDetails = (
  hasProfile: boolean,
  hasFeed: boolean,
  spacing: number,
  borderRadius: string,
) => ({
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
  margin: [spacing, spacing],
  containerPadding: [spacing, spacing],
  borderRadius,
});

type GridDetails = ReturnType<typeof makeGridDetails>;

type GridLayoutConfig = LayoutFidgetConfig<PlacedGridItem[]>;

const ReactGridLayout = WidthProvider(RGL);

interface GridlinesProps {
  maxRows: number;
  cols: number;
  rowHeight: number;
  margin: number[];
  containerPadding: number[];
  borderRadius: string;
}

const Gridlines: React.FC<GridlinesProps> = ({
  maxRows,
  cols,
  rowHeight,
  margin,
  containerPadding,
  borderRadius,
}) => {
  return (
    <div
      className="absolute inset-0 grid-overlap w-full h-full opacity-50 pointer-events-none"
      style={{
        transition: "background-color 1000ms linear",
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${maxRows}, ${rowHeight}px)`,
        gridGap: `${margin[0]}px`,
        rowGap: `${margin[1]}px`,
        padding: `${containerPadding[0]}px`,
        background: "rgba(200, 227, 248, 0.011)",
        zIndex: 10, // Behind everything else
      }}
    >
      {[...Array(cols * maxRows)].map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "rgba(200, 227, 248, 0.5)",
            outline: "2px dashed rgba(200, 227, 248, 0.3)",
            borderRadius,
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
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  const memoizedGridDetails = useMemo(
    () =>
      makeGridDetails(
        hasProfile,
        hasFeed,
        parseInt(theme?.properties?.gridSpacing ?? "16"),
        theme?.properties?.fidgetBorderRadius ?? "12px",
      ),
    [
      hasProfile,
      hasFeed,
      theme?.properties?.gridSpacing,
      theme?.properties?.fidgetBorderRadius,
    ],
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

  const fidgetInstanceDatumsRef = useRef(fidgetInstanceDatums);

  useEffect(() => {
    fidgetInstanceDatumsRef.current = fidgetInstanceDatums;
  }, [fidgetInstanceDatums]);

  const saveFidgetConfig = useCallback(
    (id: string, fidgetType?: string) =>
      async (newInstanceConfig: FidgetConfig<FidgetSettings>) => {
        const currentDatums = fidgetInstanceDatumsRef.current;
        const existing = currentDatums[id];
        
        const determinedFidgetType = existing?.fidgetType ?? fidgetType ?? "unknown";
        
        const updatedDatum: FidgetInstanceData = {
          id: existing?.id ?? id,
          fidgetType: determinedFidgetType,
          config: newInstanceConfig,
        };

        return await saveFidgetInstanceDatums({
          ...currentDatums,
          [id]: updatedDatum,
        });
      },
    [saveFidgetInstanceDatums],
  );

  // Debounced save function
  const debouncedSaveConfig = useCallback(
    debounce((config) => {
      saveConfig(config);
    }, 100),
    [saveConfig],
  );

  function unselectFidget() {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselectFidget();
  }

  function openFidgetPickerAtPosition(x: number, y: number) {
    setTargetPosition({ x, y });
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
        await saveFidgetConfig(bundle.id, bundle.fidgetType)({
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
          memoizedGridDetails.margin[0] * (memoizedGridDetails.maxRows - 1) -
          memoizedGridDetails.containerPadding[0] * 2) /
          memoizedGridDetails.maxRows
              : memoizedGridDetails.rowHeight;
  }, [
    height, 
    hasProfile, 
    memoizedGridDetails.margin, 
    memoizedGridDetails.containerPadding, 
    memoizedGridDetails.maxRows
  ]);

  async function handleDrop(
    _layout: PlacedGridItem[],
    item: PlacedGridItem,
    e: DragEvent<HTMLDivElement>,
  ) {
    const fidgetData: FidgetInstanceData = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );

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

    // Save layout and fidget data immediately so editing has the latest state
    await saveConfig({
      layoutConfig: { layout: [...layoutConfig.layout, newItem] },
      fidgetInstanceDatums: { ...fidgetInstanceDatums, [fidgetData.id]: fidgetData },
    });

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
    //Make new layout with item removed
    const newLayout = reject(layoutConfig.layout, (x) => x.i == fidgetId);

    saveLayout(newLayout);
  }

  function removeFidgetFromInstanceDatums(fidgetId: string) {
    // New set of instances - use computed property name to remove the correct fidget
    const { [fidgetId]: removed, ...newFidgetInstanceDatums } =
      fidgetInstanceDatums;

    saveFidgetInstanceDatums(newFidgetInstanceDatums);
  }

  function removeFidget(fidgetId: string) {
    unselectFidget();

    // Create new state objects
    const newLayout = layoutConfig.layout.filter((item) => item.i !== fidgetId);
    const newTrayContents = fidgetTrayContents.filter(
      (fidget) => fidget.id !== fidgetId,
    );
    const { [fidgetId]: removed, ...newFidgetInstanceDatums } =
      fidgetInstanceDatums;

    console.log("newFidgetInstanceDatums", newFidgetInstanceDatums);
    // Only save if we have fidgets left or if we're removing the last one
    if (
      Object.keys(newFidgetInstanceDatums).length > 0 ||
      newLayout.length === 0
    ) {
      debouncedSaveConfig({
        layoutConfig: { layout: newLayout },
        fidgetTrayContents: newTrayContents,
        fidgetInstanceDatums: newFidgetInstanceDatums,
      });
    }
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
      debouncedSaveConfig({
        layoutConfig: { layout: newLayout },
      });
    }
  }

  /**
   * Adds a given fidget to the grid at a specific position.
   * If the position is occupied, returns false. Otherwise, returns true.
   */
  const addFidgetToGridAtPosition = (fidget: FidgetBundle, x: number, y: number): boolean => {
    const { fidgetType, id } = fidget;
    const fidgetProps = CompleteFidgets[fidgetType].properties;
    const minW = fidgetProps.size.minWidth;
    const minH = fidgetProps.size.minHeight;

    // Check if the position is available
    const isSpaceAvailable = (
      x: number,
      y: number,
      w: number,
      h: number,
    ): boolean => {
      // Check boundaries
      if (x + w > memoizedGridDetails.cols || y + h > memoizedGridDetails.maxRows) {
        return false;
      }
      
      // Check for collisions with existing items
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

      // Save both layout and fidgetInstanceDatums in a single operation
      debouncedSaveConfig({
        layoutConfig: { layout: [...layoutConfig.layout, newItem] },
        fidgetInstanceDatums: { ...fidgetInstanceDatums, [id]: fidget },
      });

      analytics.track(AnalyticsEvent.ADD_FIDGET, {
        fidgetType: fidget.fidgetType,
      });
      return true;
    }

    return false;
  };

  /**
   * Adds a given fidget to the grid by finding the first available space based on its minimum size.
   * If no space is available, returns false. Otherwise, returns true.
   */
  const addFidgetToGrid = (fidget: FidgetBundle): boolean => {
    // If we have a target position, try to add there first
    if (targetPosition) {
      const success = addFidgetToGridAtPosition(fidget, targetPosition.x, targetPosition.y);
      setTargetPosition(null); // Clear target position after use
      if (success) return true;
    }

    // Fall back to finding the first available space
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
    for (let x = 0; x <= memoizedGridDetails.cols - minW; x++) {
      for (let y = 0; y <= memoizedGridDetails.maxRows - minH; y++) {
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

          // Save both layout and fidgetInstanceDatums in a single operation
          debouncedSaveConfig({
            layoutConfig: { layout: [...layoutConfig.layout, newItem] },
            fidgetInstanceDatums: { ...fidgetInstanceDatums, [id]: fidget },
          });

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
          onExportConfig={exportSpaceConfig}
          getCurrentSpaceContext={() => ({
            fidgetInstanceDatums,
            fidgetTrayContents,
            layoutConfig,
            theme,
            layoutID: layoutConfig.layout.length > 0 ? 'grid' : undefined,
          })}
          onApplySpaceConfig={saveConfig}
        />,
        portalNode,
      )
    ) : (
      <></>
    );
  }

  const [itemsVisible] = useState(true);
  // Consider using CSS animations or useLayoutEffect for the fade-in effect,
  // so that SSR and hydration don't render blank content.

  // Log initial config state
  useEffect(() => {
    // console.log('Grid received config:', {
    //   fidgetIds: Object.keys(fidgetInstanceDatums),
    //   layoutIds: layoutConfig.layout.map(item => item.i),
    //   trayIds: fidgetTrayContents.map(fidget => fidget.id)
    // });
  }, []);

  // Export function to generate SpaceConfig JSON
  const exportSpaceConfig = useCallback(() => {
    // Convert theme to UserTheme if needed
    let exportTheme: typeof defaultUserTheme = defaultUserTheme;
    if (theme && 'properties' in theme) {
      // Check if all required UserTheme properties exist
      const requiredKeys = Object.keys(defaultUserTheme.properties);
      const hasAllKeys = requiredKeys.every(key => key in theme.properties);
      if (hasAllKeys) {
        exportTheme = theme as typeof defaultUserTheme;
      } else {
        // Fill missing keys with defaults
        exportTheme = {
          ...theme,
          properties: {
            ...defaultUserTheme.properties,
            ...theme.properties,
          },
        };
      }
    }
    const spaceConfig: SpaceConfig = {
      layoutID: uuidv4(),
      layoutDetails: {
        layoutConfig: {
          layout: layoutConfig.layout,
        },
        layoutFidget: "grid",
      },
      theme: exportTheme,
      fidgetInstanceDatums: fidgetInstanceDatums,
      fidgetTrayContents: fidgetTrayContents,
      isEditable: false,
      timestamp: new Date().toISOString(),
      fid: fid,
    };

    // Create and download the JSON file
    const dataStr = JSON.stringify(spaceConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `space-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Space configuration exported successfully!");
  }, [fidgetInstanceDatums, fidgetTrayContents, layoutConfig, theme, fid]);

  // Simplified state - no hover state needed with CSS-only approach
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseOverGrid, setIsMouseOverGrid] = useState(false);
  const [isMouseOverControlButtons, setIsMouseOverControlButtons] = useState(false);

  // DOM-based control button detection
  const checkControlButtonArea = useCallback((e: React.MouseEvent) => {
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
    const isOverControls = !!elementUnderMouse?.closest('[data-fidget-controls]');
    setIsMouseOverControlButtons(isOverControls);
  }, []);

  // Simplified position checking
  const isPositionOccupied = useCallback((x: number, y: number): boolean => {
    return layoutConfig.layout.some(item => 
      x >= item.x && x < item.x + item.w && 
      y >= item.y && y < item.y + item.h
    );
  }, [layoutConfig.layout]);

  // Find the first empty grid square (top-left to bottom-right) for hint
  const findFirstEmptySquare = useCallback((): { x: number; y: number } | null => {
    for (let y = 0; y < memoizedGridDetails.maxRows; y++) {
      for (let x = 0; x < memoizedGridDetails.cols; x++) {
        if (!isPositionOccupied(x, y)) {
          return { x, y };
        }
      }
    }
    return null;
  }, [memoizedGridDetails.maxRows, memoizedGridDetails.cols, isPositionOccupied]);

  const firstEmptySquare = useMemo(() => findFirstEmptySquare(), [findFirstEmptySquare]);

  // Simplified grid cell click handler using CSS Grid auto-placement
  const handleGridCellClick = useCallback((e: React.MouseEvent) => {
    if (!inEditMode) return;
    
    // Find the clicked cell using event delegation
    const target = e.target as HTMLElement;
    const cellElement = target.closest('[data-grid-x]') as HTMLElement;
    
    if (!cellElement) return;
    
    // Get grid position from data attributes (much simpler!)
    const gridX = parseInt(cellElement.dataset.gridX || '0');
    const gridY = parseInt(cellElement.dataset.gridY || '0');
    
    // Check if position is valid and not occupied
    if (gridX >= 0 && gridX < memoizedGridDetails.cols && 
        gridY >= 0 && gridY < memoizedGridDetails.maxRows && 
        !isPositionOccupied(gridX, gridY)) {
      openFidgetPickerAtPosition(gridX, gridY);
    }
  }, [inEditMode, memoizedGridDetails.cols, memoizedGridDetails.maxRows, isPositionOccupied]);

  // CSS Grid auto-placement overlay component
  const GridOverlay = ({ inEditMode }: { inEditMode: boolean }) => {
    // Don't show overlay during interactions that should block it
    if (!inEditMode || currentlyDragging || isPickingFidget) {
      return null;
    }

    return (
      <div
        ref={gridContainerRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${memoizedGridDetails.cols}, 1fr)`,
          gridTemplateRows: `repeat(${memoizedGridDetails.maxRows}, ${rowHeight}px)`,
          gridGap: `${memoizedGridDetails.margin[0]}px`,
          rowGap: `${memoizedGridDetails.margin[1]}px`,
          padding: `${memoizedGridDetails.containerPadding[0]}px`,
          height: rowHeight * memoizedGridDetails.maxRows + "px",
          zIndex: 10, // Lower z-index to stay below fidget control buttons
        }}
        onMouseEnter={() => setIsMouseOverGrid(true)}
        onMouseLeave={() => {
          setIsMouseOverGrid(false);
          setIsMouseOverControlButtons(false);
        }}
        onMouseMove={checkControlButtonArea}
      >
        {[...Array(memoizedGridDetails.cols * memoizedGridDetails.maxRows)].map((_, i) => {
          const x = i % memoizedGridDetails.cols;
          const y = Math.floor(i / memoizedGridDetails.cols);
          const isOccupied = isPositionOccupied(x, y);
          const isHintSquare = !isMouseOverGrid && firstEmptySquare?.x === x && firstEmptySquare?.y === y;

          if (isOccupied) {
            return <div key={i} className="pointer-events-none" />;
          }

          return (
            <div
              key={i}
              data-grid-x={x}
              data-grid-y={y}
              className={`
                relative 
                pointer-events-auto 
                cursor-pointer
                transition-all 
                duration-300 
                ease-out 
                group
                ${isHintSquare 
                  ? 'opacity-30' 
                  : 'opacity-0'
                }
                ${!isMouseOverControlButtons ? 'hover:opacity-80' : ''}
              `}
              style={{
                // Extend hover area to center of margins
                margin: `-${memoizedGridDetails.margin[0] / 2}px -${memoizedGridDetails.margin[1] / 2}px`,
                // Compensate for the negative margin with padding to maintain visual size
                padding: `${memoizedGridDetails.margin[0] / 2}px ${memoizedGridDetails.margin[1] / 2}px`,
              }}
              onClick={handleGridCellClick}
            >
              {/* Visual feedback area - matches original cell size */}
              <div 
                className={`
                  absolute
                  inset-0
                  transition-all 
                  duration-300 
                  ease-out 
                  ${!isMouseOverControlButtons ? 'group-hover:bg-blue-50 group-hover:border-blue-200' : ''}
                  ${isHintSquare 
                    ? 'bg-blue-25 border-blue-100' 
                    : ''
                  }
                `}
                style={{
                  borderRadius: memoizedGridDetails.borderRadius,
                  border: '2px solid transparent',
                  // Position within the padded area to match original cell size
                  margin: `${memoizedGridDetails.margin[0] / 2}px ${memoizedGridDetails.margin[1] / 2}px`,
                  ...(isHintSquare && {
                    backgroundColor: 'rgba(59, 130, 246, 0.02)',
                    borderColor: 'rgba(59, 130, 246, 0.1)',
                  }),
                }}
              >
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-400 ease-out ${
                  isHintSquare 
                    ? `opacity-30 ${!isMouseOverControlButtons ? 'group-hover:opacity-100' : ''}` 
                    : `opacity-0 ${!isMouseOverControlButtons ? 'group-hover:opacity-100' : ''}`
                }`}>
                  <div className={`text-blue-600 transition-colors duration-250 ease-out ${!isMouseOverControlButtons ? 'hover:text-blue-700' : ''}`}>
                    <AddFidgetIcon />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Remove all the complex hover system code and replace with simple overlay
  return (
    <>
      {editorPanelPortal(element)}

      <div className="flex flex-col z-10">
        <div className="flex-1 grid-container grow relative">
          {inEditMode && (
            <Gridlines 
              {...memoizedGridDetails} 
              rowHeight={rowHeight} 
            />
          )}

          <div className="relative">
            <ReactGridLayout
              {...memoizedGridDetails}
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
                height: rowHeight * memoizedGridDetails.maxRows + "px",
                transition: "opacity 0.2s ease-in",
                opacity: itemsVisible ? 1 : 0,
                position: "relative",
                zIndex: 20,
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
                  className="grid-item"
                  style={{
                    borderRadius: memoizedGridDetails.borderRadius,
                    outline:
                      selectedFidgetID === gridItem.i
                        ? "4px solid rgb(2 132 199)" /* sky-600 */
                        : undefined,
                    outlineOffset:
                      selectedFidgetID === gridItem.i
                        ? -parseInt(theme?.properties?.fidgetBorderWidth ?? "0")
                        : undefined,
                  }}
                >
                  <FidgetWrapper
                    fidget={fidgetModule.fidget}
                    context={{ theme }}
                    borderRadius={memoizedGridDetails.borderRadius}
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
          
          <GridOverlay inEditMode={inEditMode} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Grid;