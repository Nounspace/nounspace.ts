import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../stores/app";

export const useHomebaseTabConfig = (tabName: string) => {
  const loadTab = useAppStore((state) => state.homebase.loadHomebaseTab);
  return useQuery({
    queryKey: ["homebase-tab-config", tabName],
    suspense: true,
    queryFn: () => loadTab(tabName),
  });
};

export const useSpaceTabConfig = (spaceId: string | null, tabName: string) => {
  const loadTab = useAppStore((state) => state.space.loadSpaceTab);
  return useQuery({
    queryKey: ["space-tab-config", spaceId, tabName],
    enabled: !!spaceId,
    suspense: true,
    queryFn: () => {
      if (!spaceId) return null;
      return loadTab(spaceId, tabName);
    },
  });
};
