import React, { createContext, useState, useCallback, useEffect } from "react";
import defaultTheme from "@/common/lib/theme/defaultTheme";
import setGlobalStyleProperty from "@/common/lib/utils/setGlobalStyleProperty";
import { GlobalTheme } from "@/common/lib/theme";

export interface UserThemeContextValue {
  userTheme: GlobalTheme;
  saveUserTheme: (theme: GlobalTheme) => void;
}

export const UserThemeContext = createContext<
  UserThemeContextValue | undefined
>(undefined);

export const UserThemeContextProvider = ({ children }) => {
  const [userTheme, setUserTheme] = useState<GlobalTheme>(defaultTheme);

  const { background, font } = userTheme.properties;

  const saveUserTheme = useCallback((_theme: GlobalTheme): void => {
    setUserTheme(_theme);
  }, []);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setGlobalStyleProperty("--user-theme-font", font);
  }, [font]);

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
