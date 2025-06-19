"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import Navigation from "./Navigation";
import AiChatSidebar from "./AiChatSidebar";
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
  portalRef: React.RefObject<HTMLDivElement>; // For manual editor
  aiPortalRef: React.RefObject<HTMLDivElement>; // For AI chat
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
  const portalRef = useRef<HTMLDivElement>(null); // For manual editor
  const aiPortalRef = useRef<HTMLDivElement>(null); // For AI chat

  // Enhanced setters to handle mode conflicts
  const handleSetEditMode = useCallback((value: boolean) => {
    if (value && editWithAiMode) {
      // If trying to enable edit mode while AI mode is active, disable AI mode first
      setEditWithAiMode(false);
      console.log("🔄 Switching from AI mode to manual edit mode");
    }
    setEditMode(value);
  }, [editWithAiMode]);

  const handleSetEditWithAiMode = useCallback((value: boolean) => {
    if (value && editMode) {
      // If trying to enable AI mode while edit mode is active, disable edit mode first
      setEditMode(false);
      console.log("🔄 Switching from manual edit mode to AI mode");
    }
    setEditWithAiMode(value);
  }, [editMode]);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode: handleSetEditMode,
      editWithAiMode,
      setEditWithAiMode: handleSetEditWithAiMode,
      sidebarEditable,
      setSidebarEditable,
      portalRef,
      aiPortalRef,
      previewConfig,
      setPreviewConfig,
      isPreviewMode,
      setIsPreviewMode,
    }),
    [
      editMode,
      editWithAiMode,
      sidebarEditable,
      portalRef,
      aiPortalRef,
      previewConfig,
      isPreviewMode,
      handleSetEditMode,
      handleSetEditWithAiMode,
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
    aiPortalRef,
  } = useSidebarContext();

  const aiChatSidebarPortal = (portalNode: HTMLDivElement | null) => {
    return editWithAiMode && portalNode
      ? createPortal(
          <AiChatSidebar onClose={() => setEditWithAiMode(false)} />,
          portalNode
        )
      : null;
  };

  return (
    <>
      {/* Separate portal for AI Chat */}
      <div
        ref={aiPortalRef}
        className={editWithAiMode ? "w-full" : ""}
      >
        {aiChatSidebarPortal(aiPortalRef.current)}
      </div>
      
      {/* Separate portal for Manual Editor - this is handled by Grid component */}
      <div
        ref={portalRef}
        className={editMode ? "w-full" : ""}
      />
      
      {/* Navigation - hidden when either mode is active */}
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
