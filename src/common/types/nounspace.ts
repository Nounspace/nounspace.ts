/**
 * Space layout configuration with support for multiple view modes
 */
export interface SpaceLayoutConfig {
  layouts: {
    mobile?: {
      layout: string[]; // Ordered array of fidgetIds
      layoutFidget: string; // "tabFullScreen"
    };
    desktop?: {
      layout: {
        i: string; // fidgetId
        x: number;
        y: number;
        w: number;
        h: number;
        minW?: number;
        maxW?: number;
        minH?: number;
        maxH?: number;
        resizeHandles?: string[];
        static?: boolean;
        moved?: boolean;
      }[];
      layoutFidget: string; // "grid"
    };
    presentation?: {
      layout: {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }[];
      layoutFidget: string; // "grid"
    };
  };
  defaultLayout: "mobile" | "desktop" | "presentation";
}
