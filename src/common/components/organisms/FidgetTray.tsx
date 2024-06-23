import { FidgetConfig, FidgetSettings } from "@/common/fidgets";
import React, { Dispatch, SetStateAction } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import { PlacedGridItem } from "@/fidgets/layout/Grid";
import { number } from "prop-types";
import { FidgetInstanceData } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const PlusIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M12 19L12 5"
        stroke="#1C64F2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export interface FidgetTrayProps {
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  contents: FidgetInstanceData[];
  openFidgetPicker: () => void;
  saveTrayContents: (fidgetTrayContents: FidgetInstanceData[]) => Promise<void>;
}

export const FidgetTray: React.FC<FidgetTrayProps> = ({
  contents,
  setExternalDraggedItem,
  openFidgetPicker,
}) => {
  return (
    <div className="w-full h-screen flex-col justify-center items-center bg-sky-100 p-8">
      {contents.map((fidgetData: FidgetInstanceData) => {
        return (
          <div key={fidgetData.id} className="flex justify-center items-center">
            <div
              className="z-20 droppable-element justify-center items-center mx-4 rounded-lg rounded-lg hover:bg-sky-200 group"
              draggable={true}
              // unselectable helps with IE support
              // eslint-disable-next-line react/no-unknown-property
              unselectable="on"
              onDragStart={(e) => {
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
              {fidgetData.fidgetType}
            </div>
          </div>
        );
      })}
      <div className="flex justify-center items-center h-16 w-full">
        <button
          onClick={openFidgetPicker}
          className="z-10 flex justify-center items-center mx-4 rounded-lg rounded-lg hover:bg-sky-200 group h-16 w-16 mx-auto"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default FidgetTray;
