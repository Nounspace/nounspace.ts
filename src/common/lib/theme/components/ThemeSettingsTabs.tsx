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
    <TabsList className={tabListClasses}>
      <TabsTrigger 
        value="style" 
        className={tabTriggerClasses}
        onClick={() => onTabChange("style")}
      >
        Style
      </TabsTrigger>
      <TabsTrigger 
        value="fonts" 
        className={tabTriggerClasses}
        onClick={() => onTabChange("fonts")}
      >
        Fonts
      </TabsTrigger>
      <TabsTrigger 
        value="code" 
        className={tabTriggerClasses}
        onClick={() => onTabChange("code")}
      >
        Code
      </TabsTrigger>
      <TabsTrigger 
        value="mobile" 
        className={tabTriggerClasses}
        onClick={() => onTabChange("mobile")}
      >
        Mobile
      </TabsTrigger>
    </TabsList>
  );
};

export default ThemeSettingsTabs;
