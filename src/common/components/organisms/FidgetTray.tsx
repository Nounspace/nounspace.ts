import React, { Dispatch, SetStateAction } from "react";
import { map } from "lodash";
import { FidgetInstanceData } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
import { Button } from "@/common/components/atoms/button";
import { FaPlus } from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/common/components/atoms/tooltip";
import { FaInfoCircle } from "react-icons/fa";
export interface FidgetTrayProps {
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  contents: FidgetInstanceData[];
  openFidgetPicker: () => void;
  saveTrayContents: (fidgetTrayContents: FidgetInstanceData[]) => Promise<void>;
  removeFidget(fidgetId: string): void;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FidgetTray: React.FC<FidgetTrayProps> = ({
  setCurrentlyDragging,
  contents,
  setExternalDraggedItem,
  openFidgetPicker,
}) => {
  return (
    <div className="w-full h-screen flex flex-col justify-start items-center gap-2 bg-sky-50 py-7 px-6 overflow-auto">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <center>
              <FaInfoCircle color="#D1D5DB" />
            </center>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="flex flex-col gap-1">
              <div>
                Click the + to browse Fidgets.
                <br />
                Then, drag them to your Space
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <h5 className="text-xs font-medium text-center -mx-3 mb-3">
        Fidget Tray
      </h5>
      {map(contents, (fidgetData: FidgetInstanceData) => {
        return (
          <div key={fidgetData.id} className="w-full">
            <div
              className="z-20 droppable-element px-2 py-2 flex justify-center items-center border rounded-md hover:bg-sky-100 group cursor-pointer"
              draggable={true}
              // unselectable helps with IE support
              // eslint-disable-next-line react/no-unknown-property
              unselectable="on"
              onDragStart={(e) => {
                setCurrentlyDragging(true);
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify(fidgetData),
                );
                setExternalDraggedItem({
                  i: fidgetData.id,
                  w: CompleteFidgets[fidgetData.fidgetType].properties.size
                    .minWidth,
                  h: CompleteFidgets[fidgetData.fidgetType].properties.size
                    .minHeight,
                });
              }}
            >
              {String.fromCodePoint(
                CompleteFidgets[fidgetData.fidgetType].properties.icon,
              )}
            </div>
          </div>
        );
      })}
      <div className="flex justify-center items-center w-full">
        <Button onClick={openFidgetPicker} withIcon variant="primary">
          <FaPlus />
        </Button>
      </div>
    </div>
  );
};

export default FidgetTray;
