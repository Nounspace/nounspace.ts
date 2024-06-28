import React, { Dispatch, SetStateAction } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { isUndefined, map } from "lodash";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";

export interface FidgetPickerProps {
  addFidgetToTray: (fidgetId: string, fidget: FidgetModule<any>) => void;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  generateFidgetInstance(
    fidgetId: string,
    fidget: FidgetModule<FidgetArgs>,
  ): FidgetInstanceData;
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
      (fidgetModule: FidgetModule<FidgetArgs> | undefined, fidgetId) => {
        if (isUndefined(fidgetModule)) return null;
        return (
          <div
            key={fidgetName}
            className="z-20 droppable-element h-full"
            draggable={true}
            // unselectable helps with IE support
            // eslint-disable-next-line react/no-unknown-property
            unselectable="on"
            onDragStart={(e) => {
              setCurrentlyDragging(true);
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify(generateFidgetInstance(fidgetId, fidgetModule)),
              );
              setExternalDraggedItem({
                i: fidgetId,
                w: fidgetModule.properties.size.minWidth,
                h: fidgetModule.properties.size.minHeight,
              });
            }}
          >
            <button
              key={fidgetId}
              className="size-full"
              onClick={() => addFidgetToTray(fidgetId, fidgetModule)}
            >
              <Card className="size-full bg-[#F3F4F6]">
                <CardContent className="overflow-hidden">
                  <div className="bg-white m-2 rounded-lg h-20">
                    <span
                      className={
                        "size-full flex items-center justify-center text-5xl"
                      }
                      role="img"
                      aria-label={fidgetModule.properties.fidgetName}
                    >
                      {String.fromCodePoint(fidgetModule.properties.icon)}
                    </span>
                  </div>
                  <span className="text-md text-black block capitalize">
                    {fidgetModule.properties.fidgetName}
                  </span>
                </CardContent>
              </Card>
            </button>
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
