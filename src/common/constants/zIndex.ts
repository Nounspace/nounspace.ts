
export const Z_INDEX = {
  // Camada base (z-index: 1) - elementos que precisam estar acima do background
  BASE: 1,
  
  // Content layer (z-index: 2) - main content, grids, cards
  CONTENT: 2,
  
  // Interface layer (z-index: 3) - navigation, headers, sidebars
  INTERFACE: 3,
  
  // Overlay layer (z-index: 4) - modals, dropdowns, tooltips
  OVERLAY: 4,
  
  // Top layer (z-index: 5) - critical elements that must always be on top
  TOP: 5,
} as const;

export type ZIndexLevel = keyof typeof Z_INDEX;


export const Z_INDEX_CLASSES = {
  BASE: 'z-[1]',
  CONTENT: 'z-[2]', 
  INTERFACE: 'z-[3]',
  OVERLAY: 'z-[4]',
  TOP: 'z-[5]',
} as const;


export const Z_INDEX_VALUES = {
  BASE: Z_INDEX.BASE,
  CONTENT: Z_INDEX.CONTENT,
  INTERFACE: Z_INDEX.INTERFACE,
  OVERLAY: Z_INDEX.OVERLAY,
  TOP: Z_INDEX.TOP,
} as const;
