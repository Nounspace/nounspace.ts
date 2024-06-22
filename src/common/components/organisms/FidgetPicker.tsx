import React from "react";
import { CompleteFidgets } from "@/fidgets";
import { Button } from "../atoms/button";
import { Card, CardContent } from "../atoms/card";
import _ from "lodash";
import {
  FidgetArgs,
  FidgetData,
  FidgetModule,
  FidgetProperties,
  FidgetSettings,
} from "@/common/fidgets";
import { MouseEventHandler } from "react";

export interface FidgetPickerProps {
  addFidgetToTray: (fidgetObj) => undefined;
}

export const FidgetPicker: React.FC<FidgetPickerProps> = ({
  addFidgetToTray: addFidgetToTray,
}) => {
  const fidgetCoverImages = {
    example:
      "https://i.fbcd.co/products/resized/resized-750-500/2992-2e43bbf282e5f024b49b9d0e380c2e60c119e50418e2233456517844da4386a2.jpg",
    frame:
      "https://media.istockphoto.com/id/1147136165/vector/photo-frame-icon-stock-vector.jpg?s=612x612&w=0&k=20&c=BvQKIbtwz4Z2MXEK8MT62IQ1Xl6GM3iW68VEyWGXS-U=",
    gallery:
      "https://t4.ftcdn.net/jpg/02/98/19/59/360_F_298195987_xCfHMVXXk694FwTMPXZkyqb5mFplKVe8.jpg",
  };

  function generateFidgetCards() {
    return _.map(CompleteFidgets, (fidgetModule, fidgetName) => {
      return (
        <Button
          className="flex items-center justify-center"
          onClick={addFidgetToTray(fidgetModule)}
        >
          <Card className="">
            <CardContent className="size-full overflow-hidden">
              <img
                src={fidgetCoverImages[fidgetName]}
                id={fidgetName}
                alt="fidget"
                className="h-4/12 w-4/12 object-cover rounded-t-xl"
              />
              <div className="px-2 py-2">
                <span className="text-gray-400 mr-3 uppercase text-xs">
                  Nounspace
                </span>
                <p className="text-lg font-bold text-black truncate block capitalize">
                  {fidgetName}
                </p>
              </div>
            </CardContent>
          </Card>
        </Button>
      );
    });
  }

  return (
    <>
      <div className="text-center pt-10">
        <h1 className="font-bold text-4xl">Fidgets</h1>
      </div>

      <section
        id="Fidgets"
        className="w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 justify-items-center justify-center gap-y-10 mt-10 mb-5"
      >
        {generateFidgetCards()}
      </section>
    </>
  );
};

export default FidgetPicker;
