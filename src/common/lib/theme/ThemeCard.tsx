import React from "react";

import { ThemeProperties } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/components/molecules/FontSelector";

import { FaCheck } from "react-icons/fa";

export const ThemeCard = ({
  themeProps,
  onClick,
  active,
}: {
  themeProps: ThemeProperties;
  onClick?: () => void;
  active?: boolean;
}) => {
  const activeRingBeforeElementClasses =
    "before:content-[''] before:absolute before:inset-0 before:rounded-lg before:ring-2 before:ring-blue-500 before:z-[3]";
  const font =
    FONT_FAMILY_OPTIONS_BY_NAME[themeProps.font]?.config?.style.fontFamily;
  const headingsFont =
    FONT_FAMILY_OPTIONS_BY_NAME[themeProps.headingsFont]?.config?.style
      .fontFamily;

  return (
    <div
      className={`shadow-md w-full bg-gray-50 hover:bg-gray-100 rounded-lg grid [grid-template-areas:'cell'] h-11 cursor-pointer relative ${active ? activeRingBeforeElementClasses : ""}`}
      style={{
        backgroundColor: themeProps.background,
      }}
      onClick={onClick}
    >
      {active && (
        <div className="absolute -right-1 -top-1 w-4 h-4 bg-blue-500 rounded-full grid place-content-center z-[3]">
          <FaCheck className="fill-white w-2 h-2" />
        </div>
      )}
      {themeProps.backgroundHTML && (
        <div className="[grid-area:cell] relative overflow-hidden rounded-lg">
          <CustomHTMLBackground
            html={themeProps.backgroundHTML}
            className="absolute pointer-events-none inset-0"
          />
        </div>
      )}
      <div className="[grid-area:cell] flex gap-2 px-4 py-2 items-center z-[3]">
        <div className="text-lg font-bold">
          <span
            style={{
              fontFamily: headingsFont,
              color: themeProps.headingsFontColor,
            }}
          >
            A
          </span>
          <span
            style={{
              fontFamily: font,
              color: themeProps.fontColor,
            }}
          >
            a
          </span>
        </div>
        <div
          className="rounded-full w-5 h-5 bg-blue-500"
          style={{
            backgroundColor: themeProps.fidgetBackground,
            borderWidth: themeProps.fidgetBorderWidth,
            borderColor: themeProps.fidgetBorderColor,
            boxShadow: themeProps.fidgetShadow,
          }}
        ></div>
      </div>
    </div>
  );
};
