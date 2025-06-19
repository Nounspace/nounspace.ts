"use client";
import { useEffect, useMemo } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { UserTheme } from "@/common/lib/theme";
import { useAppStore } from "@/common/data/stores/app";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

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
    // console.log(`Theme selected: Space tab - ${currentSpaceId}, ${currentTabName ?? "Profile"}`);
    // console.log("Theme:", currentSpace?.tabs[currentTabName ?? "Profile"]?.theme);
    return (
      currentSpace?.tabs[currentTabName ?? "Profile"]?.theme ?? defaultTheme
    );
  }
};

export const UserThemeProvider = ({ children }) => {
  const { previewConfig, isPreviewMode } = useSidebarContext();
  const userTheme = useUserTheme();

  // Use preview theme if in preview mode, otherwise use regular theme
  const activeTheme = useMemo(() => {
    if (isPreviewMode && previewConfig?.theme) {
      console.log("🎨 Using preview theme:", previewConfig.theme.name);
      return previewConfig.theme;
    }
    console.log("🎨 Using regular theme:", userTheme?.name);
    return userTheme;
  }, [isPreviewMode, previewConfig?.theme, userTheme]);

  // Debug logging for theme switching
  useEffect(() => {
    console.log("🎨 UserThemeProvider - Theme State:", {
      isPreviewMode,
      hasPreviewConfig: !!previewConfig,
      hasPreviewTheme: !!previewConfig?.theme,
      previewThemeName: previewConfig?.theme?.name,
      regularThemeName: userTheme?.name,
      activeThemeName: activeTheme?.name,
      backgroundChanged: isPreviewMode
        ? previewConfig?.theme?.properties?.background
        : userTheme?.properties?.background,
    });
  }, [isPreviewMode, previewConfig, userTheme, activeTheme]);

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
    fidgetBorderRadius,
    gridSpacing,
  } = activeTheme.properties;

  // Log preview mode changes for debugging
  useEffect(() => {
    if (isPreviewMode && previewConfig?.theme) {
      console.log(
        "🎨 Preview mode: Applying preview theme",
        previewConfig.theme.name
      );
    }
  }, [isPreviewMode, previewConfig?.theme]);

  useEffect(() => {
    console.log("🎨 Background CSS update:", background);
    setGlobalStyleProperty("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-font-color", fontColor);
  }, [fontColor]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-headings-font-color",
      headingsFontColor
    );
  }, [headingsFontColor]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-font",
      FONT_FAMILY_OPTIONS_BY_NAME[font]?.config?.style.fontFamily
    );
  }, [font]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-headings-font",
      FONT_FAMILY_OPTIONS_BY_NAME[headingsFont]?.config?.style.fontFamily
    );
  }, [headingsFont]);

  useEffect(() => {
    console.log("🎨 Fidget background CSS update:", fidgetBackground);
    setGlobalStyleProperty("--user-theme-fidget-background", fidgetBackground);
  }, [fidgetBackground]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-fidget-border-width",
      fidgetBorderWidth
    );
  }, [fidgetBorderWidth]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-fidget-border-color",
      fidgetBorderColor
    );
  }, [fidgetBorderColor]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-fidget-shadow", fidgetShadow);
  }, [fidgetShadow]);

  useEffect(() => {
    setGlobalStyleProperty(
      "--user-theme-fidget-border-radius",
      fidgetBorderRadius
    );
  }, [fidgetBorderRadius]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-grid-spacing", gridSpacing);
  }, [gridSpacing]);

  return children;
};

export default UserThemeProvider;
