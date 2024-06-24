import React from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { map } from "lodash";
import { FidgetModule } from "@/common/fidgets";

export interface FidgetPickerProps {
  addFidgetToTray: (fidget: FidgetModule<any>) => void;
}

export const FidgetPicker: React.FC<FidgetPickerProps> = ({
  addFidgetToTray: addFidgetToTray,
}) => {
  function generateFidgetCards() {
    return map(CompleteFidgets, (fidgetModule, fidgetName) => {
      return (
        <button
          key={fidgetName}
          className="w-10/12 flex items-center justify-center"
          onClick={() => addFidgetToTray(fidgetModule)}
        >
          <Card className="size-full">
            <CardContent className="overflow-hidden">
              <span className={""} role="img" aria-label={fidgetName}>
                {String.fromCodePoint(fidgetModule.properties.icon)}
              </span>
              <span className="text-md font-bold text-black block capitalize">
                {fidgetName}
              </span>
            </CardContent>
          </Card>
        </button>
      );
    });
  }

  return (
    <>
      <div className="text-center pt-10">
        <h1 className="font-bold text-xl">Add Fidget</h1>
      </div>

      <section
        id="Fidgets"
        className="w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 justify-items-center justify-center gap-y-4 mt-10 mb-5"
      >
        {generateFidgetCards()}
      </section>
    </>
  );
};

export default FidgetPicker;
