import React from "react";
import Navigation from "./Navigation";

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
  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      {!editMode && (
        <Navigation isEditable={isEditable} setEditMode={setEditMode} />
      )}
    </>
  );
};

export default Sidebar;
