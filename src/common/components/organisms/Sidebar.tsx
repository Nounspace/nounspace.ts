import { ThemeSettings } from "@/common/lib/theme";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import EditorPanel from "./EditorPanel";
import Navigation from "./Navigation";
import { FidgetInstanceData } from "@/common/fidgets";

export interface SidebarProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  isEditable: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  setEditMode,
  isEditable,
  portalRef,
}) => {
  function turnOnEditMode() {
    setEditMode(true);
  }

  return (
    <>
      <div ref={portalRef} className="w-full"></div>
      {!editMode && (
        <Navigation isEditable={isEditable} setEditMode={setEditMode} />
      )}
    </>
  );
};

export default Sidebar;
