import React from "react";
import DefaultGrid from "@/fidgets/layout/grids/defaultGrid";
import Gallery from "@/fidgets/ui/gallery";
import Feed from "@/pages/feed";

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

const Space = ({ config, isEditable }: SpaceArgs) => {
  return (
    <DefaultGrid>
      <Feed/>
      <Gallery />
      <div className="p-4 bg-slate-300 row-span-2 col-span-2 rounded-md flex items-center justify-center"></div>
      <div className="p-4 bg-slate-300 row-span-2 col-span-2 rounded-md flex items-center justify-center"></div>
      <div className="p-4 bg-slate-300 row-span-2 col-span-4 rounded-md flex items-center justify-center"></div>
      <div className="p-4 bg-slate-300 row-span-2 col-span-4 rounded-md flex items-center justify-center"></div>
      <div className="p-4 bg-slate-300 row-span-2 col-span-2 rounded-md flex items-center justify-center"></div>
    </DefaultGrid>
  );
};

export default Space;