import { useEffect } from "react";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import useCurrentSpaceTheme from "@/common/lib/hooks/useCurrentSpaceTheme";

export const UserThemeProvider = ({ children }) => {
  const userTheme = useCurrentSpaceTheme();

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
