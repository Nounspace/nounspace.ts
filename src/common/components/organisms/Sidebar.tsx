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
export interface SidebarProps {}

export type SidebarContextProviderProps = { children: React.ReactNode };

export type SidebarContextValue = {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  editWithAiMode: boolean;
  setEditWithAiMode: (value: boolean) => void;
  sidebarEditable: boolean;
  setSidebarEditable: (value: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
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
  const portalRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      editWithAiMode,
      setEditWithAiMode,
      sidebarEditable,
      setSidebarEditable,
      portalRef,
    }),
    [editMode, editWithAiMode, sidebarEditable, portalRef]
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
