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
import { ThemeEditorTab } from "@/common/lib/theme/types";

interface ThemeSettingsTabsProps {
  activeTab: ThemeEditorTab;
  onTabChange: (value: ThemeEditorTab) => void;
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
          value={ThemeEditorTab.SPACE} 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === ThemeEditorTab.SPACE ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange(ThemeEditorTab.SPACE)}
          data-state={activeTab === ThemeEditorTab.SPACE ? "active" : "inactive"}
        >
          Space
          {activeTab === ThemeEditorTab.SPACE && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value={ThemeEditorTab.FIDGETS} 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === ThemeEditorTab.FIDGETS ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange(ThemeEditorTab.FIDGETS)}
          data-state={activeTab === ThemeEditorTab.FIDGETS ? "active" : "inactive"}
        >
          Fidgets
          {activeTab === ThemeEditorTab.FIDGETS && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value={ThemeEditorTab.MOBILE} 
          className={mergeClasses(
            tabTriggerClasses,
            "flex-shrink-0 px-3 py-2 relative text-gray-500",
            activeTab === ThemeEditorTab.MOBILE ? "text-blue-600" : ""
          )}
          onClick={() => onTabChange(ThemeEditorTab.MOBILE)}
          data-state={activeTab === ThemeEditorTab.MOBILE ? "active" : "inactive"}
        >
          Mobile
          {activeTab === ThemeEditorTab.MOBILE && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t" />
          )}
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default ThemeSettingsTabs;