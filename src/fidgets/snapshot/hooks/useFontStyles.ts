import { useMemo } from 'react';

interface UseFontStylesProps {
  headingsFontFamily?: string;
  fontFamily?: string;
  headingsFontColor?: string | any;
  fontColor?: string | any;
}

export const useFontStyles = ({
  headingsFontFamily,
  fontFamily,
  headingsFontColor,
  fontColor,
}: UseFontStylesProps) => {
  return useMemo(() => {
    const getHeadingsFontFamily = () => {
      return headingsFontFamily === "Theme Headings Font"
        ? "var(--user-theme-headings-font)"
        : headingsFontFamily || "var(--user-theme-headings-font)";
    };

    const getBodyFontFamily = () => {
      return fontFamily === "Theme Font"
        ? "var(--user-theme-font)"
        : fontFamily || "var(--user-theme-font)";
    };

    const getHeadingsFontColor = () => {
      if (headingsFontColor &&
        headingsFontColor.toString() !== "var(--user-theme-headings-font-color)") {
        return headingsFontColor;
      }
      return '#000000';
    };

    const getBodyFontColor = () => {
      if (fontColor &&
        fontColor.toString() !== "var(--user-theme-font-color)") {
        return fontColor;
      }
      return '#333333';
    };

    return {
      headingsFont: getHeadingsFontFamily(),
      bodyFont: getBodyFontFamily(),
      headingsColor: getHeadingsFontColor(),
      bodyColor: getBodyFontColor(),
    };
  }, [headingsFontFamily, fontFamily, headingsFontColor, fontColor]);
};
