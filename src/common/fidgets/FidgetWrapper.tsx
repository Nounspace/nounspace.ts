import { Card, CardContent } from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import ScopedStyles from "@/common/components/molecules/ScopedStyles";
import { useAppStore } from "@/common/data/stores/app";
import { reduce } from "lodash";
import React, { useMemo } from "react";
import { FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import {
  FidgetArgs,
  FidgetBundle,
  FidgetConfig,
  FidgetData,
  FidgetProperties,
  FidgetRenderContext,
  FidgetSettings,
} from ".";
import GrabHandleIcon from "../components/atoms/icons/GrabHandle";
import StashIcon from "../components/atoms/icons/Stash";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/atoms/tooltip";
import FidgetSettingsEditor from "../components/organisms/FidgetSettingsEditor";

export type FidgetWrapperProps = {
  fidget: React.FC<FidgetArgs>;
  bundle: FidgetBundle;
  context?: FidgetRenderContext;
  saveConfig: (conf: FidgetConfig) => Promise<void>;
  setCurrentFidgetSettings: (currentFidgetSettings: React.ReactNode) => void;
  setSelectedFidgetID: (selectedFidgetID: string) => void;
  selectedFidgetID: string;
  removeFidget: (fidgetId: string) => void;
  minimizeFidget: (fidgetId: string) => void;
  borderRadius?: string;
};

export const getSettingsWithDefaults = (
  settings: FidgetSettings,
  config: FidgetProperties,
): FidgetSettings => {
  return reduce(
    config.fields,
    (acc, f) => ({
      ...acc,
      [f.fieldName]:
        settings && typeof settings === 'object' && f.fieldName in settings
          ? settings[f.fieldName]
          : f.default || undefined,
    }),
    {},
  );
};

export function FidgetWrapper({
  fidget,
  bundle,
  saveConfig,
  setCurrentFidgetSettings,
  setSelectedFidgetID,
  selectedFidgetID,
  removeFidget,
  minimizeFidget,
  borderRadius,
}: FidgetWrapperProps) {
  const { homebaseConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
  }));

  function onClickEdit() {
    setSelectedFidgetID(bundle.id);
    setCurrentFidgetSettings(
      <FidgetSettingsEditor
        fidgetId={bundle.id}
        properties={bundle.properties}
        settings={settingsWithDefaults}
        onSave={onSave}
        unselect={unselect}
        removeFidget={removeFidget}
      />,
    );
  }

  const Fidget = fidget;

  // Only mount heavy fidget content when it's visible in viewport or when selected.
  const isClient = typeof window !== "undefined";
  const { ref, inView } = useInView({
    /*
      rootMargin gives a small pre-load buffer so fidgets just outside the
      viewport are mounted slightly before they appear.
    */
    rootMargin: "300px",
    triggerOnce: true,
  });

  const shouldMountFidget = useMemo(() => {
    // always mount if selected
    if (selectedFidgetID === bundle.id) return true;
    // if not client (SSR), avoid mounting heavy content
    if (!isClient) return false;
    // mount when in view (or already triggered)
    return inView;
  }, [selectedFidgetID, bundle.id, isClient, inView]);

  const saveData = (data: FidgetData) => {
    return saveConfig({
      ...bundle.config,
      data,
    });
  };

  const settingsWithDefaults = getSettingsWithDefaults(
    bundle.config.settings,
    bundle.properties,
  );

  const onSave = async (
    newSettings: FidgetSettings,
    shouldUnselect?: boolean,
  ) => {
    try {
      await saveConfig({
        ...bundle.config,
        settings: newSettings,
      });
    } catch (e) {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    }

    if (shouldUnselect) {
      unselect();
    }
  };

  function unselect() {
    setSelectedFidgetID("");
    setCurrentFidgetSettings(<></>);
  }

  const userStyles = bundle.properties.fields
    .filter((f) => f.inputSelector === CSSInput)
    .map((f) => settingsWithDefaults[f.fieldName]);

  return (
    <>
      <div
        className={
          selectedFidgetID === bundle.id
            ? "absolute -mt-7 opacity-80 transition-opacity ease-in flex flex-row h-6 z-50"
            : "absolute -mt-7 opacity-0 transition-opacity ease-in flex flex-row h-6 z-50"
        }
        data-fidget-controls
      >
        <Card className="h-full grabbable rounded-lg w-6 flex items-center justify-center bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <GrabHandleIcon />
                </div>
              </TooltipTrigger>
              <TooltipContent>Drag to Move</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Card>
        <button
          onClick={() => {
            minimizeFidget(bundle.id);
          }}
        >
          <Card className="h-full rounded-lg ml-1 w-6 flex items-center justify-center bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <StashIcon />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Stash in Fidget Tray</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Card>
        </button>
        <button
          onClick={() => {
            removeFidget(bundle.id);
          }}
        >
          <Card className="h-full rounded-lg ml-1 w-6 flex items-center justify-center bg-[#F3F4F6] hover:bg-red-100 text-[#1C64F2]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FaX className="w-5/12" />
                </TooltipTrigger>
                <TooltipContent>Remove Fidget</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Card>
        </button>
      </div>
      <Card
        className={
          selectedFidgetID === bundle.id
            ? "size-full border-solid border-sky-600 border-4 overflow-hidden"
            : "size-full overflow-hidden"
        }
        style={{
          background: settingsWithDefaults.useDefaultColors 
            ? homebaseConfig?.theme?.properties.fidgetBackground
            : settingsWithDefaults.background,
          borderColor: settingsWithDefaults.useDefaultColors
            ? homebaseConfig?.theme?.properties.fidgetBorderColor
            : settingsWithDefaults.fidgetBorderColor,
          borderWidth: settingsWithDefaults.useDefaultColors
            ? homebaseConfig?.theme?.properties.fidgetBorderWidth
            : settingsWithDefaults.fidgetBorderWidth,
          boxShadow: settingsWithDefaults.useDefaultColors
            ? homebaseConfig?.theme?.properties.fidgetShadow
            : settingsWithDefaults.fidgetShadow,
          borderRadius: borderRadius ?? homebaseConfig?.theme?.properties.fidgetBorderRadius ?? "12px",
        }}
      >
        {bundle.config.editable && (
          <button
            onMouseDown={onClickEdit}
            className="items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-30 flex bg-slate-400 bg-opacity-50 rounded-md"
          ></button>
        )}
        <ScopedStyles cssStyles={userStyles} className="size-full">
          <CardContent className="size-full p-0">
            <div ref={ref} className="size-full">
              {shouldMountFidget ? (
                <Fidget
                  {...{
                    settings: settingsWithDefaults,
                    data: bundle.config.data,
                    saveData,
                  }}
                />
              ) : (
                // lightweight placeholder keeps layout stable until fidget mounts
                <div aria-hidden className="w-full h-full bg-transparent" />
              )}
            </div>
          </CardContent>
        </ScopedStyles>
      </Card>
    </>
  );
}
