import React, { useEffect } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { UserTheme } from "@/common/lib/theme";
import { useAppStore } from "@/common/data/stores";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";

export interface UserThemeContextValue {
  userTheme: UserTheme;
}

export const useUserTheme = () => {
  const { userTheme } = useAppStore((state) => ({
    userTheme: state?.homebase?.homebaseConfig?.theme,
  }));

  return userTheme ?? defaultTheme;
};

export const UserThemeProvider = ({ children }) => {
  const userTheme = useUserTheme();

  const { background, font, fontColor, headingsFont, headingsFontColor } =
    userTheme.properties;

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

  return children;
};

export default UserThemeProvider;
