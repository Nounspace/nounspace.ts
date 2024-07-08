import { useState, useEffect, useCallback } from "react";
import { mapValues } from "lodash";
import { useAppStore } from "@/common/data/stores/app";
import { SpaceConfig } from "@/common/components/templates/Space";
import useIsSpaceEditable from "@/common/lib/hooks/useIsSpaceEditable";
import { SpaceId } from "@/common/data/stores/app/space/spaceStore";
import { useCurrentSpaceId } from "@/common/lib/hooks/useIsSpaceEditable";

const HOMEBASE_ID = "homebase";

interface useSpaceConfigReturnValue {
  spaceConfig?: SpaceConfig | null;
  loading: boolean;
}

export const useCurrentSpaceConfig = (): useSpaceConfigReturnValue => {
  const spaceId = useCurrentSpaceId();
  return useSpaceConfig(spaceId);
};

// Gets space config from local data store (localStorage)
const useLocalSpaceConfig = (spaceId?: SpaceId | null): SpaceConfig | null => {
  const isEditable = useIsSpaceEditable(spaceId);

  return useAppStore((state) => {
    if (spaceId === HOMEBASE_ID) return state.homebase.homebaseConfig;
    if (!spaceId || !(spaceId in state.space.localSpaces)) return null;

    const spaceConfig = state.space.localSpaces[spaceId];
    if (!spaceConfig) return null;

    const fidgetInstanceDatums = mapValues(
      spaceConfig.fidgetInstanceDatums,
      (datum) => ({
        ...datum,
        config: {
          settings: datum.config.settings,
          editable: datum.config.editable,
          data: {}, // TO DO: Inject fidget data here
        },
      }),
    );

    // Populate missing fields
    return { ...spaceConfig, isEditable, fidgetInstanceDatums };
  }) as SpaceConfig | null;
};

export const useSpaceConfig = (
  spaceId?: SpaceId | null,
): useSpaceConfigReturnValue => {
  const [loading, setLoading] = useState(false);
  const { loadSpace, setCurrentSpaceId } = useAppStore((state) => ({
    loadSpace: state.space.loadSpace,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
  }));
  const spaceConfig = useLocalSpaceConfig(spaceId);

  const refetch = useCallback(async () => {
    if (spaceId) {
      setLoading(true);
      await loadSpace(spaceId);
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    if (spaceId) {
      setCurrentSpaceId(spaceId);
      refetch();
    }
  }, [spaceId]);

  return { spaceConfig, loading };
};

export default useCurrentSpaceConfig;
