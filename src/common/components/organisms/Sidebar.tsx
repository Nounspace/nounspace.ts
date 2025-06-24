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
  const portalRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      sidebarEditable,
      setSidebarEditable,
      portalRef,
    }),
    [editMode, sidebarEditable, portalRef],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebarContext = (): SidebarContextValue => {
  return useContext(SidebarContext);
};

export const Sidebar: React.FC<SidebarProps> = () => {
  const { editMode, sidebarEditable, portalRef } = useSidebarContext();

  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      <div className={editMode ? "hidden" : "md:flex h-full hidden"}>
        <Navigation isEditable={sidebarEditable} />
      </div>
    </>
  );
};

export default Object.assign(Sidebar, {
  ContextProvider: SidebarContextProvider
});
