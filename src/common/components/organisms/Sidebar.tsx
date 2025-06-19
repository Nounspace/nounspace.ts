"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import Navigation from "./Navigation";
import AiChatSidebar from "./AiChatSidebar";
import { useAppStore } from "@/common/data/stores/app";
import { SpaceConfig } from "@/app/(spaces)/Space";
export interface SidebarProps {}

export type SidebarContextProviderProps = { children: React.ReactNode };
// test
export type SidebarContextValue = {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  editWithAiMode: boolean;
  setEditWithAiMode: (value: boolean) => void;
  sidebarEditable: boolean;
  setSidebarEditable: (value: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
  previewConfig: any | null;
  setPreviewConfig: (config: any | null) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (value: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextValue>(
  {} as SidebarContextValue
);

export const SidebarContextProvider: React.FC<SidebarContextProviderProps> = ({
  children,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editWithAiMode, setEditWithAiMode] = useState(false);
  const [sidebarEditable, setSidebarEditable] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<any | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  // Debug logging for preview state changes
  const setPreviewConfigWithLogging = (config: any | null) => {
    console.log("🔄 Sidebar Context: Setting preview config:", {
      hasConfig: !!config,
      configType: config ? typeof config : "null",
      configKeys: config ? Object.keys(config) : [],
      fidgetCount: config?.fidgetInstanceDatums ? Object.keys(config.fidgetInstanceDatums).length : 0
    });
    setPreviewConfig(config);
  };

  const setIsPreviewModeWithLogging = (value: boolean) => {
    console.log("🔄 Sidebar Context: Setting preview mode:", value);
    setIsPreviewMode(value);
  };

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      editWithAiMode,
      setEditWithAiMode,
      sidebarEditable,
      setSidebarEditable,
      portalRef,
      previewConfig,
      setPreviewConfig: setPreviewConfigWithLogging,
      isPreviewMode,
      setIsPreviewMode: setIsPreviewModeWithLogging,
    }),
    [
      editMode,
      editWithAiMode,
      sidebarEditable,
      portalRef,
      previewConfig,
      isPreviewMode,
      setPreviewConfigWithLogging,
      setIsPreviewModeWithLogging,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebarContext = (): SidebarContextValue => {
  return useContext(SidebarContext);
};

export const Sidebar: React.FC<SidebarProps> = () => {
  const {
    editMode,
    editWithAiMode,
    setEditWithAiMode,
    sidebarEditable,
    portalRef,
  } = useSidebarContext();

  // Get current space configuration from store
  const { getCurrentSpaceConfig, getCurrentTabName } = useAppStore((state) => ({
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,
    getCurrentTabName: state.currentSpace.getCurrentTabName,
  }));

  // Get the current space configuration for the AI
  const spaceContext = useMemo(() => {
    const currentSpaceConfig = getCurrentSpaceConfig();
    const currentTabName = getCurrentTabName();
    
    if (!currentSpaceConfig || !currentTabName) {
      return null;
    }

    const currentTabConfig = currentSpaceConfig.tabs[currentTabName];
    if (!currentTabConfig) {
      return null;
    }

    // Return a simplified space context for the AI
    return {
      fidgetInstanceDatums: currentTabConfig.fidgetInstanceDatums || {},
      layoutID: currentTabConfig.layoutID || '',
      layoutDetails: currentTabConfig.layoutDetails || null,
      theme: currentTabConfig.theme || null,
      fidgetTrayContents: currentTabConfig.fidgetTrayContents || [],
    };
  }, [getCurrentSpaceConfig, getCurrentTabName]);

  const aiChatSidebarPortal = (portalNode: HTMLDivElement | null) => {
    return editWithAiMode && portalNode
      ? createPortal(
          <AiChatSidebar 
            onClose={() => setEditWithAiMode(false)} 
          />,
          portalNode
        )
      : null;
  };

  return (
    <>
      <div
        ref={portalRef}
        className={editMode || editWithAiMode ? "w-full" : ""}
      >
        {aiChatSidebarPortal(portalRef.current)}
      </div>
      <div
        className={
          editMode || editWithAiMode
            ? "hidden"
            : "md:flex mx-auto h-full hidden"
        }
      >
        <Navigation isEditable={sidebarEditable} />
      </div>
    </>
  );
};

export default Sidebar;
