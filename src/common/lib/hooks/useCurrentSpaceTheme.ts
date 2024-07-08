import { useCurrentSpaceConfig } from "@/common/lib/hooks/useCurrentSpaceConfig";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { UserTheme } from "@/common/lib/theme";

export const useCurrentSpaceTheme = (): UserTheme => {
  const { spaceConfig } = useCurrentSpaceConfig();
  return spaceConfig?.theme ?? DEFAULT_THEME;
};

export default useCurrentSpaceTheme;
