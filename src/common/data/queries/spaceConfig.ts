import { useSuspenseQuery } from "@tanstack/react-query";
import { useAppStore } from "../stores/app";

export const useHomebaseTabConfig = (tabName: string) => {
  const loadTab = useAppStore((state) => state.homebase.loadHomebaseTab);
  return useSuspenseQuery({
    queryKey: ["homebase-tab-config", tabName],
    queryFn: () => loadTab(tabName),
  });
};

export const useSpaceTabConfig = (spaceId: string | null, tabName: string) => {
  const loadTab = useAppStore((state) => state.space.loadSpaceTab);
  return useSuspenseQuery({
    queryKey: ["space-tab-config", spaceId, tabName],
    enabled: !!spaceId,
    queryFn: () => {
      if (!spaceId) return undefined;
      return loadTab(spaceId, tabName);
    },
  });
};
