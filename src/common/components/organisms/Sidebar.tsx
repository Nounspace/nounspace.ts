import React from "react";
import Navigation from "./Navigation";
import { UserTheme } from "@/common/lib/theme";

export interface SidebarProps {
  editMode: boolean;
  enterEditMode: () => void;
  theme?: UserTheme;
  isEditable: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  enterEditMode,
  isEditable,
  portalRef,
  theme,
}) => {
  return (
    <>
      <div ref={portalRef} className={editMode ? "w-full" : ""}></div>
      <div className={editMode ? "hidden" : "flex mx-auto"}>
        <Navigation
          isEditable={isEditable}
          enterEditMode={enterEditMode}
          theme={theme}
        />
      </div>
    </>
  );
};

export default Sidebar;
