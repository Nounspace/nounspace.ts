import { useContext } from "react";
import {
  UserThemeContext,
  UserThemeContextValue,
} from "@/common/lib/theme/UserThemeContextProvider";

export const useUserTheme = (): UserThemeContextValue => {
  const context = useContext(UserThemeContext)!;

  return context;
};

export default useUserTheme;
