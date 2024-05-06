import { useAccountStore } from "@/common/data/stores/useAccountStore";
import Space from "@/common/ui/templates/space";
import ChannelFidget from "@/fidgets/example";
import { useState } from "react";
import { RiPencilFill } from "react-icons/ri";

export default function Homebase(spaceID) {
  const [editMode, setMode] = useState(false);

  //const { getCurrentUser } = useAccountStore();
  const user = useAccountStore.getState().accounts[0];

  const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

  const [fidgetConfigs, setFidgetConfigs] = useState([
    { f: <ChannelFidget title="Bright Moments" channel="bright-moments" />, resizeHandles: availableHandles, x: 0, y: 0, w: 4, minW: 1, h: 8, minH: 1 },
    { f: <ChannelFidget title="Invaders" channel="invaders" />, resizeHandles: availableHandles, x: 4, y: 0, w: 4, minW: 1, h: 8, minH: 1 },
  ]);

  function switchMode() {
    setMode(!editMode);
  }

  function retrieveConfig(user, space) {
    const layoutConfig = {
      isDraggable: editMode,
      isResizable: editMode,
      items: 2,
      cols: 12,
      rowHeight: 70,
      onLayoutChange: function () {},
      // This turns off compaction so you can place items wherever.
      compactType: null,
      // This turns off rearrangement so items will not be pushed arround.
      preventCollision: true,
    };
    const layoutID = "";

    return { fidgetConfigs, layoutConfig, layoutID };
  }

  return (
    <div>
      <div className={editMode ? "edit-grid absolute inset-0 z-0" : "no-edit-grid  absolute inset-0 z-0"} />
      <button
        onClick={switchMode}
        className={
          editMode
            ? "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-90 hover:opacity-100 duration-500"
            : "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-50 hover:opacity-100 duration-500"
        }
      >
        <RiPencilFill
          className={
            editMode
              ? "text-slate-900 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              : "x  text-gray-700 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
          }
        />
      </button>
      <Space config={retrieveConfig(user, spaceID)} isEditable={editMode}></Space>
    </div>
  );
}
