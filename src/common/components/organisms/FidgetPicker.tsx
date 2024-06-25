import React, { Dispatch, SetStateAction } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { map } from "lodash";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import { Button } from "../atoms/button";
import BackArrowIcon from "../atoms/icons/BackArrow";

export interface FidgetPickerProps {
  addFidgetToTray: (fidget: FidgetModule<any>) => void;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  generateFidgetInstance(fidget: FidgetModule<FidgetArgs>): FidgetInstanceData;
  setIsPickingFidget: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FidgetPicker: React.FC<FidgetPickerProps> = ({
  addFidgetToTray,
  setExternalDraggedItem,
  setCurrentlyDragging,
  generateFidgetInstance,
  setIsPickingFidget,
}) => {
  function generateFidgetCards() {
    return map(
      CompleteFidgets,
      (fidgetModule: FidgetModule<FidgetArgs>, fidgetName) => {
        return (
          <div
            className="z-20 droppable-element"
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
                <span className={"flex"} role="img" aria-label={fidgetName}>
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
      <div className="flex pb-4 m-2">
        <button
          onClick={() => {
            setIsPickingFidget(false);
          }}
          className="my-auto"
        >
          <BackArrowIcon />
        </button>
        <h1 className="capitalize text-lg pl-4">Add Fidget</h1>
      </div>

      <section
        id="Fidgets"
        className="mx-auto grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-4"
      >
        {generateFidgetCards()}
      </section>
    </>
  );
};

export default FidgetPicker;
