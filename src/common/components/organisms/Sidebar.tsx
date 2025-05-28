"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
} from "react";
import Navigation from "./Navigation";
export interface SidebarProps {}

export type SidebarContextProviderProps = { children: React.ReactNode };

export type SidebarContextValue = {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  sidebarEditable: boolean;
  setSidebarEditable: (value: boolean) => void;
  mobilePreview: boolean;
  setMobilePreview: (value: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
};

export const SidebarContext = createContext<SidebarContextValue>(
  {} as SidebarContextValue,
);

export const SidebarContextProvider: React.FC<SidebarContextProviderProps> = ({
  children,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [sidebarEditable, setSidebarEditable] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      sidebarEditable,
      setSidebarEditable,
      mobilePreview,
      setMobilePreview,
      portalRef,
    }),
    [editMode, sidebarEditable, mobilePreview, portalRef],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebarContext = (): SidebarContextValue => {
  return useContext(SidebarContext);
};

export const Sidebar: React.FC<SidebarProps> = () => {
  const { editMode, setEditMode, sidebarEditable, portalRef } =
    useSidebarContext();

  function enterEditMode() {
    setEditMode(true);
  }

  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      <div className={editMode ? "hidden" : "md:flex h-full hidden"}>
        <Navigation
          isEditable={sidebarEditable}
          enterEditMode={enterEditMode}
        />
      </div>
    </>
  );
};

export default Sidebar;
