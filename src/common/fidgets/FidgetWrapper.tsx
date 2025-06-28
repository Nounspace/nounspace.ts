import { Card, CardContent } from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import ScopedStyles from "@/common/components/molecules/ScopedStyles";
import { useAppStore } from "@/common/data/stores/app";
import { reduce } from "lodash";
import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaX } from "react-icons/fa6";
import { toast } from "sonner";
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

export type FidgetWrapperProps<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
> = {
  fidget: React.FC<FidgetArgs<S, D>>;
  bundle: FidgetBundle<S, D>;
  context?: FidgetRenderContext;
  saveConfig: (conf: FidgetConfig<S, D>) => Promise<void>;
  setCurrentFidgetSettings: (currentFidgetSettings: React.ReactNode) => void;
  setSelectedFidgetID: (selectedFidgetID: string) => void;
  selectedFidgetID: string;
  removeFidget: (fidgetId: string) => void;
  minimizeFidget: (fidgetId: string) => void;
  allowDelete?: boolean;
};

export const getSettingsWithDefaults = <
  S extends FidgetSettings = FidgetSettings,
>(
  settings: S | undefined,
  config: FidgetProperties<S>,
): S => {
  const safeSettings = settings ?? ({} as Partial<S>);
  return reduce(
    config.fields,
    (acc, f) => ({
      ...acc,
      [f.fieldName]:
        f.fieldName in safeSettings
          ? (safeSettings as Record<string, unknown>)[f.fieldName]
          : f.default ?? undefined,
    }),
    {} as Partial<S>,
  ) as S;
};

export function FidgetWrapper<
  S extends FidgetSettings = FidgetSettings,
  D extends FidgetData = FidgetData,
>({
  fidget,
  bundle,
  context,
  saveConfig,
  setCurrentFidgetSettings,
  setSelectedFidgetID,
  selectedFidgetID,
  removeFidget,
  minimizeFidget,
  allowDelete = true,
}: FidgetWrapperProps<S, D>) {
  const { homebaseConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
  }));

  const themeProps = (context?.theme ?? homebaseConfig?.theme)?.properties;

  function onClickEdit() {
    setSelectedFidgetID(bundle.id);
    setCurrentFidgetSettings(
      <FidgetSettingsEditor
        fidgetId={bundle.id}
        properties={bundle.properties}
        settings={settingsWithDefaults}
        onSave={
          onSave as (settings: FidgetSettings, shouldUnselect?: boolean) => void
        }
        unselect={unselect}
        removeFidget={removeFidget}
        showRemoveButton={allowDelete}
      />,
    );
  }

  const Fidget = fidget;

  const saveData = (data: D) => {
    return saveConfig({
      ...bundle.config,
      data,
    });
  };

  const settingsWithDefaults = getSettingsWithDefaults(
    bundle.config.settings,
    bundle.properties,
  );

  const onSave = (
    newSettings: S,
    shouldUnselect?: boolean,
  ): void => {
    saveConfig({
      ...bundle.config,
      settings: newSettings,
    }).catch(() => {
      toast.error("Failed to save fidget settings", { duration: 1000 });
    });

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

  const fidgetRef = useRef<HTMLDivElement>(null);
  const [iconPosition, setIconPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    let animationFrameId: number;
    let isActive = false;
    
    const updateIconPosition = () => {
      if (selectedFidgetID === bundle.id && fidgetRef.current && isActive) {
        const rect = fidgetRef.current.getBoundingClientRect();
        setIconPosition({
          top: rect.top - 28, // 28px above the fidget
          left: rect.left,
        });
        
        // Continue updating position while this fidget is selected
        animationFrameId = requestAnimationFrame(updateIconPosition);
      }
    };

    if (selectedFidgetID === bundle.id) {
      isActive = true;
      // Start continuous position updates when this fidget is selected
      updateIconPosition();
    }

    return () => {
      isActive = false;
      // Clean up animation frame when component unmounts or selection changes
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedFidgetID, bundle.id]);

  const renderActionIcons = () => {
    if (typeof window === "undefined") return null;
    
    return createPortal(
      <div
        className={
          selectedFidgetID === bundle.id
            ? "fixed opacity-80 transition-opacity ease-in flex flex-row h-6"
            : "fixed opacity-0 pointer-events-none transition-opacity ease-in flex flex-row h-6"
        }
        style={{
          top: iconPosition.top,
          left: iconPosition.left,
          zIndex: 999999,
        }}
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
        {allowDelete && (
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
        )}
      </div>,
      document.body
    );
  };

  return (
    <>
      {renderActionIcons()}
      <Card
        ref={fidgetRef}
        className={
          (selectedFidgetID === bundle.id
            ? "size-full border-solid border-sky-600 border-4 rounded-2xl"
            : "size-full") + " relative"
        }
        style={{
          outline:
            selectedFidgetID === bundle.id
              ? "4px solid rgb(2 132 199)" /* sky-600 */
              : undefined,
          outlineOffset:
            selectedFidgetID === bundle.id
              ? -parseInt(themeProps?.fidgetBorderWidth ?? "0")
              : undefined,
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
          borderRadius: themeProps?.fidgetBorderRadius,
          overflow: "visible"
        }}
      >
        {bundle.config.editable && (
          <button
            onMouseDown={onClickEdit}
            className="items-center justify-center opacity-0 hover:opacity-50 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50"
            style={{ borderRadius: themeProps?.fidgetBorderRadius }}
          ></button>
        )}
        <ScopedStyles cssStyles={userStyles} className="size-full">
          <CardContent className="size-full" style={{ overflow: "visible" }}>
            <Fidget
              {...{
                settings: settingsWithDefaults,
                data: bundle.config.data,
                saveData,
              }}
            />
          </CardContent>
        </ScopedStyles>
      </Card>
    </>
  );
}
