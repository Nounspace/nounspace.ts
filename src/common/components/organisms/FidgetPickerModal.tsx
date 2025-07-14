import React, { Dispatch, SetStateAction } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { isUndefined, map } from "lodash";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import Modal from "../molecules/Modal";

export interface FidgetPickerModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addFidget: (fidgetId: string, fidget: FidgetModule<any>) => void;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  generateFidgetInstance(
    fidgetId: string,
    fidget: FidgetModule<FidgetArgs>,
  ): FidgetInstanceData;
}

export const FidgetPickerModal: React.FC<FidgetPickerModalProps> = ({
  isOpen,
  setIsOpen,
  addFidget,
  setExternalDraggedItem,
  setCurrentlyDragging,
  generateFidgetInstance,
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
              className="group w-full h-10 flex items-center gap-2 p-1 bg-transparent transform-gpu transition-transform will-change-transform hover:scale-[1.04]"
              onClick={() => addFidget(fidgetId, fidgetModule)}
            >
              <Card className="w-full h-full bg-[#F3F4F6] flex items-center p-1 rounded-lg">
                <CardContent className="overflow-hidden flex items-center gap-2 p-0 pl-2">
                  <div className="flex items-center justify-center w-5 h-5">
                    {/* Icon Container */}
                    <span
                      className="text-sm leading-none text-black group-hover:text-black"
                      role="img"
                      aria-label={fidgetModule.properties.fidgetName}
                    >
                      {String.fromCodePoint(fidgetModule.properties.icon)}
                    </span>
                  </div>
                  <span className="text-xs text-black text-left leading-none group-hover:text-black">
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
    <Modal
      open={isOpen}
      setOpen={setIsOpen}
      title="Add Fidget"
      description="Choose a fidget to add to your space"
      showClose={true}
      overlay={true}
    >
      <div className="h-[60vh] overflow-y-auto">
        <section
          id="Fidgets"
          className="mx-auto grid grid-cols-1 gap-1"
        >
          {generateFidgetCards()}
        </section>
      </div>
    </Modal>
  );
}; 