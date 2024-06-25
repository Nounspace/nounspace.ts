import React, { Dispatch, SetStateAction } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { map } from "lodash";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import { Button } from "../atoms/button";

export interface FidgetPickerProps {
  addFidgetToTray: (fidget: FidgetModule<any>) => void;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  generateFidgetInstance(fidget: FidgetModule<FidgetArgs>): FidgetInstanceData;
}

export const FidgetPicker: React.FC<FidgetPickerProps> = ({
  addFidgetToTray,
  setExternalDraggedItem,
  setCurrentlyDragging,
  generateFidgetInstance,
}) => {
  function generateFidgetCards() {
    return map(
      CompleteFidgets,
      (fidgetModule: FidgetModule<FidgetArgs>, fidgetName) => {
        return (
          <div
            className="z-20 droppable-element justify-center items-center mx-4 rounded-lg rounded-lg hover:bg-sky-200 group"
            draggable={true}
            // unselectable helps with IE support
            // eslint-disable-next-line react/no-unknown-property
            unselectable="on"
            onDragStart={(e) => {
              setCurrentlyDragging(true);
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify(generateFidgetInstance(fidgetModule)),
              );
              setExternalDraggedItem({
                i: fidgetModule.properties.fidgetName,
                w: CompleteFidgets[fidgetModule.properties.fidgetName]
                  .properties.size.minWidth,
                h: CompleteFidgets[fidgetModule.properties.fidgetName]
                  .properties.size.minHeight,
              });
            }}
          >
            <Card className="size-full">
              <CardContent className="overflow-hidden">
                <span className={""} role="img" aria-label={fidgetName}>
                  {String.fromCodePoint(fidgetModule.properties.icon)}
                </span>
                <span className="text-md font-bold text-black block capitalize">
                  {fidgetName}
                </span>
                <Button
                  key={fidgetName}
                  className="w-10/12 flex items-center justify-center"
                  onClick={() => addFidgetToTray(fidgetModule)}
                >
                  Add to Tray
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      },
    );
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
