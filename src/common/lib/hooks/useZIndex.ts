import { useMemo } from 'react';
import { Z_INDEX_CLASSES, Z_INDEX_VALUES, type ZIndexLevel } from '@/common/constants/zIndex';


export function useZIndex(level: ZIndexLevel) {
  return useMemo(() => ({
    className: Z_INDEX_CLASSES[level],
    value: Z_INDEX_VALUES[level],
    css: `z-index: ${Z_INDEX_VALUES[level]}`,
  }), [level]);
}

export function useMultipleZIndex(levels: ZIndexLevel[]) {
  return useMemo(() => 
    levels.reduce((acc, level) => ({
      ...acc,
      [level]: {
        className: Z_INDEX_CLASSES[level],
        value: Z_INDEX_VALUES[level],
        css: `z-index: ${Z_INDEX_VALUES[level]}`,
      }
    }), {} as Record<ZIndexLevel, ReturnType<typeof useZIndex>>)
  , [levels]);
}
