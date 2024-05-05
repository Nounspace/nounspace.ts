import React from "react";
import Space from "@/common/ui/templates/space";
import { useAccountStore } from "@/common/data/stores/useAccountStore";
import { useState } from 'react';
import { RiPencilFill } from "react-icons/ri";
import Gallery from "@/fidgets/ui/gallery";
import FrameFidget from "@/fidgets/ui/frameFidget";
import Feed from "@/pages/feed";

export default function Homebase(spaceID) {
    const [editMode, setMode] = useState(false);

    //const { getCurrentUser } = useAccountStore();
    const user = useAccountStore.getState().accounts[0];
    
    const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

    const [fidgetConfigs, setFidgetConfigs] = useState([
        {   f: <Feed/>,
            resizeHandles: availableHandles,
            x: 0,
            y: 0,
            w: 6,
            minW: 4,
            maxW: 8,
            h: 10,
            minH: 6,
            maxH: 12
        },
        {   f: <FrameFidget url = {"https://altumbase.com/degen/4888/dIVWKaIQZR"}/>,
            resizeHandles: availableHandles,
            x: 6,
            y: 0,
            w: 3,
            minW: 2,
            maxW: 4,
            h: 6,
            minH: 3,
            maxH: 12
        },
        {   f: <FrameFidget url = {"https://framedl.vercel.app?id=6390550a-d652-4bed-b258-d35ef6c9ff0dFramedl"}/>,
            resizeHandles: availableHandles,
            x: 9,
            y: 0,
            w: 3,
            minW: 2,
            maxW: 4,
            h: 4,
            minH: 3,
            maxH: 12
        },
        {   f: <Gallery/>,
            resizeHandles: availableHandles,
            x: 6,
            y: 6,
            w: 2,
            minW: 1,
            h: 4,
            minH: 1
        }
    ]);

    function switchMode() {
        setMode(!editMode);
    }  

    function retrieveConfig(user, space){
        const layoutConfig = {
            isDraggable: editMode,
            isResizable: editMode,
            items: 4,
            cols: 12,
            rowHeight: 70,
            onLayoutChange: function(){},
            // This turns off compaction so you can place items wherever.
            compactType: null,
            // This turns off rearrangement so items will not be pushed arround.
            preventCollision: true
        };
        const layoutID = "";
    
        return ({fidgetConfigs, layoutConfig, layoutID})
    }

    return (
        <div>
            <div className={editMode ? "edit-grid absolute inset-0 z-0" : "no-edit-grid  absolute inset-0 z-0"} />
            <button onClick={switchMode} 
                    className = {editMode ? "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-90 hover:opacity-100 duration-500" : "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-50 hover:opacity-100 duration-500"}>
                <RiPencilFill className={editMode ? "text-slate-900 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" : "x  text-gray-700 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"}/>
            </button>
            <Space config={retrieveConfig(user, spaceID)} isEditable={editMode}></Space>
        </div>
    )
}