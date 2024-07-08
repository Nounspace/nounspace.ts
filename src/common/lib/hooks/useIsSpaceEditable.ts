import { useMemo } from "react";
import { isNil } from "lodash";
import { SpaceConfig } from "@/common/components/templates/Space";
import {
  CachedSpace,
  SpaceId,
} from "@/common/data/stores/app/space/spaceStore";
import { useAppStore } from "@/common/data/stores/app";
import useCurrentUserFid from "@/common/lib/hooks/useCurrentUserFid";
import useEditableSpaces from "@/common/lib/hooks/useEditableSpaces";

export const useIsSpaceEditable = (
  spaceId?: SpaceId | null,
  spaceOwnerFid?: number,
): boolean => {
  const currentUserFid = useCurrentUserFid();
  const editableSpaces = useEditableSpaces();

  return useMemo(() => {
    return (
      (isNil(spaceId) && spaceOwnerFid === currentUserFid) ||
      (!isNil(spaceId) && spaceId in editableSpaces)
    );
  }, [editableSpaces, currentUserFid, spaceId, spaceOwnerFid]);
};

export const useIsCurrentSpaceEditable = (): boolean => {
  const spaceId = useCurrentSpaceId();
  return useIsSpaceEditable(spaceId);
};

export const useCurrentSpaceId = (): SpaceId | null => {
  return useAppStore((state) => state.currentSpace.currentSpaceId);
};

export const useSpace = (id: SpaceId): CachedSpace | null | undefined => {
  // @todo
  return null;
};

export const useCurrentSpace = (): CachedSpace | null | undefined => {
  // @todo
  return null;
};

export const useSpaceOwnerFid = (): number | null => {
  // @todo
  return null;
};

export default useIsSpaceEditable;
