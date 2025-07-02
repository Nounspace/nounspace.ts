import React from "react";
import {
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import {
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

interface ThemeSettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ThemeSettingsTabs: React.FC<ThemeSettingsTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <TabsList className={mergeClasses(
        tabListClasses,
        "flex-nowrap border-b border-gray-200"
      )}>
        
        <TabsTrigger 
          value="fonts" 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === "fonts" ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange("fonts")}
          data-state={activeTab === "fonts" ? "active" : "inactive"}
        >
          Space
          {activeTab === "fonts" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="style" 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === "style" ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange("style")}
          data-state={activeTab === "style" ? "active" : "inactive"}
        >
          Fidgets
          {activeTab === "style" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="mobile" 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === "mobile" ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange("mobile")}
          data-state={activeTab === "mobile" ? "active" : "inactive"}
        >
          Mobile
          {activeTab === "mobile" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default ThemeSettingsTabs;