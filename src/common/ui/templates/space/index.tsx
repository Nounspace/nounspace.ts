import React from "react";
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
    return _.map(_.range(config.layoutConfig.items), function(i) {
      return (
        <div key={i} data-grid={config.fidgetConfigs[i]} className="overflow-hidden rounded-md flex m-4 items-center">
          {config.fidgetConfigs[i].f}
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