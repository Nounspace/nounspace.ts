import { FidgetConfig, FidgetSettings } from "@/common/fidgets";
import React, { Dispatch, SetStateAction } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import { PlacedGridItem } from "@/fidgets/layout/Grid";
import { number } from "prop-types";
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

function addFidgetToTray() {}

export interface FidgetTrayProps {
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ w: number; h: number } | undefined>
  >;
  trayFidgetStorage?: {
    [key: string]: {
      instanceConfig: FidgetConfig<FidgetSettings>;
      fidgetName: string;
      id: string;
    };
  };
}

export const FidgetTray: React.FC<FidgetTrayProps> = ({
  trayFidgetStorage,
  setExternalDraggedItem,
}) => {
  return (
    <div className="w-full h-full mx-4 flex-col justify-center items-center">
      <div className="flex justify-center items-center">
        <div
          className="z-20 droppable-element justify-center items-center mx-4 rounded-lg rounded-lg hover:bg-sky-200 group"
          draggable={true}
          unselectable="on"
          onDragStart={(e) => {
            const data = { w: 2, h: 3 }; // Set minimum width and height
            e.dataTransfer.setData("text/plain", JSON.stringify(data));
            setExternalDraggedItem({ w: data.w, h: data.h });
          }}
        >
          Fidget
        </div>
      </div>
      <div className="flex justify-center items-center">
        <button
          onClick={addFidgetToTray}
          className="z-10 justify-center items-center mx-4 rounded-lg rounded-lg hover:bg-sky-200 group"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default FidgetTray;
