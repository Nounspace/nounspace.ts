import React from "react";
import {
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import {
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";

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
      <TabsList className={`${tabListClasses} flex-nowrap`}>
        <TabsTrigger 
          value="style" 
          className={`${tabTriggerClasses} flex-shrink-0 px-2 pl-0`}
          onClick={() => onTabChange("style")}
        >
          Style
        </TabsTrigger>
        <TabsTrigger 
          value="fonts" 
          className={`${tabTriggerClasses} flex-shrink-0 px-2`}
          onClick={() => onTabChange("fonts")}
        >
          Fonts
        </TabsTrigger>
        <TabsTrigger 
          value="code" 
          className={`${tabTriggerClasses} flex-shrink-0 px-2`}
          onClick={() => onTabChange("code")}
        >
          Code
        </TabsTrigger>
        <TabsTrigger 
          value="mobile" 
          className={`${tabTriggerClasses} flex-shrink-0 px-2`}
          onClick={() => onTabChange("mobile")}
        >
          Mobile
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default ThemeSettingsTabs;