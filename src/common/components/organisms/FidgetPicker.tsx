import React, { Dispatch, SetStateAction } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { isUndefined, map } from "lodash";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import BackArrowIcon from "../atoms/icons/BackArrow";

export interface FidgetPickerProps {
  addFidget: (fidgetId: string, fidget: FidgetModule<any>) => void;
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
  addFidget,
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
            key={fidgetModule.properties.fidgetName}
            className="z-20 droppable-element flex justify-center items-center transition-transform duration-300"
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
              className="w-32 h-32 flex flex-col items-center justify-center p-2"
              onClick={() => addFidget(fidgetId, fidgetModule)}
              style={{ transform: "scale(1)", transition: "transform 0.3s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Card className="w-full h-full bg-[#F3F4F6] flex flex-col items-center justify-center p-2">
                <CardContent className="overflow-hidden flex flex-col items-center justify-center p-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-2">
                    {" "}
                    {/* Icon Container */}
                    <span
                      className="text-2xl leading-none" // Consistent icon size
                      role="img"
                      aria-label={fidgetModule.properties.fidgetName}
                    >
                      {String.fromCodePoint(fidgetModule.properties.icon)}
                    </span>
                  </div>
                  <span className="text-sm text-black text-center leading-none">
                    {" "}
                    {/* Text Container */}
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
    <div className="h-full overflow-y-auto">
      <div className="flex pb-4 m-2 items-center">
        <button onClick={() => setIsPickingFidget(false)} className="my-auto">
          <BackArrowIcon />
        </button>
        <h1 className="capitalize text-lg pl-4">Add Fidget</h1>
      </div>
      <section
        id="Fidgets"
        className="mx-auto grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1"
      >
        {generateFidgetCards()}
      </section>
    </div>
  );
};

export default FidgetPicker;
