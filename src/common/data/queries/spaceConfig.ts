import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../stores/app";

export const useHomebaseTabConfig = (tabName: string) => {
  const loadTab = useAppStore((state) => state.homebase.loadHomebaseTab);
  return useQuery<void>({
    queryKey: ["homebase-tab-config", tabName],
    suspense: true,
    queryFn: async () => {
      await loadTab(tabName);
    },
  });
};

export const useSpaceTabConfig = (spaceId: string | null, tabName: string) => {
  const loadTab = useAppStore((state) => state.space.loadSpaceTab);
  return useQuery<void>({
    queryKey: ["space-tab-config", spaceId, tabName],
    enabled: !!spaceId,
    suspense: true,
    queryFn: async () => {
      if (!spaceId) return;
      await loadTab(spaceId, tabName);
    },
  });
};
