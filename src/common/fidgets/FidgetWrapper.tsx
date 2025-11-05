import { Card, CardContent } from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import ScopedStyles from "@/common/components/molecules/ScopedStyles";
import { useAppStore } from "@/common/data/stores/app";
import { reduce, isEqual } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
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

  const isDirectoryFidget = bundle.fidgetType === "Directory";
  const fetchContext = (bundle.config?.data as { fetchContext?: Record<string, unknown> } | undefined)
    ?.fetchContext;

  const derivedSettings = useMemo<FidgetSettings>(() => {
    const baseSettings = (bundle.config.settings ?? {}) as FidgetSettings;
    if (!isDirectoryFidget || !fetchContext || typeof fetchContext !== "object") {
      return baseSettings;
    }

    const context = fetchContext as Record<string, unknown>;
    const nextSettings: FidgetSettings = { ...baseSettings };
    let changed = false;

    const setString = (
      key: string,
      value: unknown,
      options?: { lowerCaseCompare?: boolean },
    ) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (!trimmed) return;

      const compareLower = options?.lowerCaseCompare ?? false;
      const normalize = (val: unknown) => {
        if (typeof val === "string") {
          const normalized = val.trim();
          return compareLower ? normalized.toLowerCase() : normalized;
        }
        return val;
      };

      const current = nextSettings[key];
      if (normalize(current) === normalize(trimmed)) {
        return;
      }

      nextSettings[key] = trimmed;
      changed = true;
    };

    const source =
      typeof context.source === "string" ? context.source.trim() : undefined;
    if (source) {
      setString("source", source);
    }

    if (source === "tokenHolders") {
      setString("contractAddress", context.contractAddress, { lowerCaseCompare: true });
      setString("network", context.network);
      setString("assetType", context.assetType);
    } else if (source === "farcasterChannel") {
      setString("channelName", context.channelName);
      setString("channelFilter", context.channelFilter);
    } else if (source === "csv") {
      setString("csvType", context.csvType);
      setString("csvSortBy", context.csvSortBy);
      setString("csvUpload", context.csvUploadedAt);
      setString("csvUploadedAt", context.csvUploadedAt);
    }

    return changed ? nextSettings : baseSettings;
  }, [bundle.config.settings, fetchContext, isDirectoryFidget]);

  const settingsWithDefaults = useMemo(
    () => getSettingsWithDefaults(derivedSettings, bundle.properties),
    [derivedSettings, bundle.properties],
  );

  const shouldAttemptBackfill =
    isDirectoryFidget &&
    !!fetchContext &&
    !isEqual(derivedSettings, bundle.config.settings ?? {});

  const lastBackfillAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldAttemptBackfill) {
      lastBackfillAttemptRef.current = null;
      return;
    }

    const serialized = JSON.stringify(derivedSettings);
    if (lastBackfillAttemptRef.current === serialized) {
      return;
    }
    lastBackfillAttemptRef.current = serialized;

    (async () => {
      try {
        await saveConfig({
          ...bundle.config,
          settings: derivedSettings,
        });
      } catch (error) {
        console.error("Failed to backfill Directory settings from fetch context", error);
        lastBackfillAttemptRef.current = null;
      }
    })();
  }, [shouldAttemptBackfill, derivedSettings, bundle.config, saveConfig]);

  const saveData = (data: FidgetData) => {
    return saveConfig({
      ...bundle.config,
      data,
    });
  };

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
