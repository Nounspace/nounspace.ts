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
  const { editMode, setEditMode, sidebarEditable, portalRef } =
    useSidebarContext();

  function enterEditMode() {
    setEditMode(true);
  }

  // Revertendo para o estilo original com controle de visibilidade
  const navStyles = {
    zIndex: 999,
    position: "relative" as const,
  };

  // Retornando às classes originais para preservar funcionalidade completa
  // Isso mantém o comportamento de expansão/contração da barra lateral
  const navWrapperClass = editMode 
    ? "hidden" 
    : "md:flex mx-auto h-full hidden relative";

  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      <div className={navWrapperClass} style={navStyles}>
        <Navigation
          isEditable={sidebarEditable}
          enterEditMode={enterEditMode}
        />
      </div>
    </>
  );
};

export default Sidebar;