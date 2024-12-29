"use client";
import { useEffect } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { UserTheme } from "@/common/lib/theme";
import { useAppStore } from "@/common/data/stores/app";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";

export interface UserThemeContextValue {
  userTheme: UserTheme;
}

export const useUserTheme = () => {
  const { getCurrentSpaceId } = useAppStore((state) => ({
    getCurrentSpaceId: state.currentSpace.getCurrentSpaceId,
  }));

  const { getCurrentSpace } = useAppStore((state) => ({
    getCurrentSpace: state.currentSpace.getCurrentSpaceConfig,
  }));

  const { getCurrentSpaceTabName } = useAppStore((state) => ({
    getCurrentSpaceTabName: state.currentSpace.getCurrentTabName,
  }));

  const { homebaseTabs } = useAppStore((state) => ({
    homebaseTabs: state.homebase.tabs,
  }));

  const { homebaseConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
  }));

  const currentSpaceId = getCurrentSpaceId();
  const currentSpace = getCurrentSpace();
  const currentTabName = getCurrentSpaceTabName();

  if (currentSpaceId === HOMEBASE_ID) {
    if (currentTabName === "Feed" || !currentTabName) {
      // console.log("Tab Name:", currentTabName);
      // console.log("Theme selected: Homebase Feed or default");
      // console.log("Theme:", homebaseConfig?.theme);
      return homebaseConfig?.theme ?? defaultTheme;
    } else {
      // console.log(`Theme selected: Homebase tab - ${currentTabName}`);
      // console.log("Theme:", homebaseTabs[currentTabName]?.config?.theme);
      return homebaseTabs[currentTabName]?.config?.theme ?? defaultTheme;
    }
  } else {
    // console.log( `Theme selected: Space tab - ${currentSpaceId}, ${currentTabName ?? "Profile"}`, );
    // console.log("Theme:",currentSpace?.tabs[currentTabName ?? "Profile"]?.theme,);
    return (
      currentSpace?.tabs[currentTabName ?? "Profile"]?.theme ?? defaultTheme
    );
  }
};

export const UserThemeProvider = ({ children }) => {
  const userTheme = useUserTheme();

  const {
    background,
    font,
    fontColor,
    headingsFont,
    headingsFontColor,
    fidgetBackground,
    fidgetBorderWidth,
    fidgetBorderColor,
    fidgetShadow,
  } = userTheme.properties;

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-font-color", fontColor);
  }, [fontColor]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-headings-font-color",
      headingsFontColor,
    );
  }, [headingsFontColor]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-font",
      FONT_FAMILY_OPTIONS_BY_NAME[font]?.config?.style.fontFamily,
    );
  }, [font]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-headings-font",
      FONT_FAMILY_OPTIONS_BY_NAME[headingsFont]?.config?.style.fontFamily,
    );
  }, [headingsFont]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-fidget-background", fidgetBackground);
  }, [fidgetBackground]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-fidget-border-width",
      fidgetBorderWidth,
    );
  }, [fidgetBorderWidth]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-fidget-border-color",
      fidgetBorderColor,
    );
  }, [fidgetBorderColor]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-fidget-shadow", fidgetShadow);
  }, [fidgetShadow]);

  return children;
};

export default UserThemeProvider;
