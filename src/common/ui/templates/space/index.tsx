import DefaultGrid from "@/fidgets/layout/grids/defaultGrid";
import Gallery from "@/fidgets/ui/gallery";
import Feed from "@/pages/feed";
import GridLayout from "react-grid-layout";
import React, { useState } from 'react';
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

type SpaceArgs = {
  config: {
    fidgetConfigs: {
      [key: string]: any
    }
    layoutID: string;
    layoutConfig: {
      [key: string]: any
    }
  };
  isEditable: boolean;
}

const ReactGridLayout = WidthProvider(RGL);

export default function Space({ config, isEditable }: SpaceArgs){
  function generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
    const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
    const layout = [
      {
        x: 0,
        y: 0,
        w: 6,
        h: 20,
        f: <Feed/>,
        resizeHandles: isEditable ? availableHandles : [],
        minW: 4,
        maxW: 8,
        minH: 10,
        maxH: 20
      },
      {
        f: <Gallery/>,
        resizeHandles: isEditable ? availableHandles : [],
        x: 6,
        y: 0,
        w: 4,
        minW: 2,
        maxW: 4,
        h: 9,
        minH: 3,
        maxH: 12
      },
    ];
    
    return _.map(_.range(config.layoutConfig.items), function(i) {
      return (
        <div key={i} data-grid={layout[i]} className="overflow-hidden rounded-md m4">
          {layout[i].f}
        </div>
      );
    });
  }

  function onLayoutChange(layout) {
    config.layoutConfig.onLayoutChange(layout);
  }

  return (
    <ReactGridLayout onLayoutChange={onLayoutChange} {...config.layoutConfig}>
      {generateDOM()}
    </ReactGridLayout>
  );
}

// if (process.env.STATIC_EXAMPLES === true) {
//   import("../test-hook.jsx").then(fn => fn.default(ResizableHandles));
// }