import { useEffect } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { UserTheme } from "@/common/lib/theme";
import { useAppStore } from "@/common/data/stores/app";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";

export interface UserThemeContextValue {
  userTheme: UserTheme;
}

export const useUserTheme = () => {
  const { getCurrentSpace } = useAppStore((state) => ({
    getCurrentSpace: state.currentSpace.getCurrentSpaceConfig,
  }));

  const { getCurrentTabName } = useAppStore((state) => ({
    getCurrentTabName: state.currentSpace.getCurrentTabName,
  }));

  const currentSpace = getCurrentSpace();
  const currentTabName = getCurrentTabName();
  return currentSpace && currentTabName && currentSpace[currentTabName]
    ? currentSpace[currentTabName].theme
    : defaultTheme;
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
