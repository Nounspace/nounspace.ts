import React, { createContext, useState, useCallback, useEffect } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { UserTheme } from "@/common/lib/theme";

export interface UserThemeContextValue {
  userTheme: UserTheme;
  saveUserTheme: (theme: UserTheme) => void;
}

export const UserThemeContext = createContext<
  UserThemeContextValue | undefined
>(undefined);

export const UserThemeContextProvider = ({ children }) => {
  const [userTheme, setUserTheme] = useState<UserTheme>(defaultTheme);

  const { background, font, fontColor, headingsFont, headingsFontColor } =
    userTheme.properties;

  const saveUserTheme = useCallback((_theme: UserTheme): void => {
    setUserTheme(_theme);
  }, []);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-font", font);
    setGlobalStyleProperty("--user-theme-font-color", fontColor);
  }, [font, fontColor]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-headings-font", headingsFont);
    setGlobalStyleProperty(
      "--user-theme-headings-font-color",
      headingsFontColor,
    );
  }, [headingsFont, headingsFontColor]);

  return (
    <UserThemeContext.Provider
      value={{
        userTheme,
        saveUserTheme,
      }}
    >
      {children}
    </UserThemeContext.Provider>
  );
};

export default UserThemeContextProvider;
