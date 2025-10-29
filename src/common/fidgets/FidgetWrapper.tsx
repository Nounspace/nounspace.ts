import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
import { isUndefined } from "lodash";
import React, { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { FixedSizeList } from "react-window";
import { Card, CardContent } from "../atoms/card";
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

const ITEM_HEIGHT = 56;

export const FidgetPicker: React.FC<FidgetPickerProps> = ({
  addFidget,
  setExternalDraggedItem,
  setCurrentlyDragging,
  generateFidgetInstance,
  setIsPickingFidget,
}) => {
  const fidgetEntries = useMemo(
    () => Object.entries(CompleteFidgets).filter(([, fidgetModule]) => !isUndefined(fidgetModule)) as
     [string, FidgetModule<FidgetArgs>][],
    [CompleteFidgets]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, fidgetId: string, fidgetModule: FidgetModule<FidgetArgs>) => {
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
    },
    [setCurrentlyDragging, setExternalDraggedItem, generateFidgetInstance]
  );

  const handleClick = useCallback(
    (fidgetId: string, fidgetModule: FidgetModule<FidgetArgs>) => {
      addFidget(fidgetId, fidgetModule);
    },
    [addFidget]
  );

  const RowComponent: React.FC<{ index: number; style: React.CSSProperties }> = ({ index, style }) => {
    const [fidgetId, fidgetModule] = fidgetEntries[index];
    return (
      <div
        key={fidgetModule.properties.fidgetName}
        className="z-20 droppable-element flex justify-center items-center transition-transform duration-300"
        draggable={true}
        style={style}
        onDragStart={(e) => handleDragStart(e, fidgetId, fidgetModule)}
      >
        <button
          key={fidgetId}
          className="group w-full h-10 flex items-center gap-2 p-1 bg-transparent transform-gpu transition-transform will-change-transform hover:scale-[1.04]"
          onClick={() => handleClick(fidgetId, fidgetModule)}
        >
          <Card className="w-full h-full bg-[#F3F4F6] flex items-center p-1 rounded-lg">
            <CardContent className="overflow-hidden flex items-center gap-2 p-0 pl-2">
              <div className="flex items-center justify-center w-5 h-5">
                <span
                  className="text-sm leading-none text-black group-hover:text-black"
                  role="img"
                  aria-label={fidgetModule.properties.fidgetName}
                >
                  {String.fromCodePoint(fidgetModule.properties.icon)}
                </span>
              </div>
              <span className="text-xs text-black text-left leading-none group-hover:text-black">
                {fidgetModule.properties.fidgetName}
              </span>
            </CardContent>
          </Card>
        </button>
      </div>
    );
  };

  const Row = React.memo(RowComponent);
  Row.displayName = "Row";

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex pb-4 m-2 items-center">
        <button onClick={() => setIsPickingFidget(false)} className="my-auto">
          <BackArrowIcon />
        </button>
        <h1 className="capitalize text-lg pl-4">Add Fidget</h1>
      </div>
      <section id="Fidgets" className="mx-auto grid grid-cols-1 gap-1">
        <FixedSizeList
          height={400}
          itemCount={fidgetEntries.length}
          itemSize={ITEM_HEIGHT}
          width={"100%"}
        >
          {Row}
        </FixedSizeList>
      </section>
    </div>
  );
};

export default FidgetPicker;
