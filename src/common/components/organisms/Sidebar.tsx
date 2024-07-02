import React from "react";
import Navigation from "./Navigation";

export interface SidebarProps {
  editMode: boolean;
  enterEditMode: () => void;
  isEditable: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  enterEditMode,
  isEditable,
  portalRef,
}) => {
  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      <div className={editMode ? "hidden" : "flex mx-auto"}>
        <Navigation isEditable={isEditable} enterEditMode={enterEditMode} />
      </div>
    </>
  );
};

export default Sidebar;
