import Space from "@/common/ui/templates/space";
import { useAccountStore } from "@/common/data/stores/useAccountStore";
import { useState } from 'react';
import { RiPencilFill } from "react-icons/ri";
import Gallery from "@/fidgets/ui/gallery";
import Feed from "@/pages/feed";

export default function Homebase(spaceID) {
    const [editMode, setMode] = useState(false);

    //const { getCurrentUser } = useAccountStore();
    const user = useAccountStore.getState().accounts[0];
    
    const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

    const [fidgetConfigs, setFidgetConfigs] = useState([
        {   
            f: <Feed/>,
            resizeHandles: availableHandles,
            x: 0,
            y: 0,
            w: 6,
            minW: 4,
            maxW: 8,
            h: 20,
            minH: 10,
            maxH: 20
        },
        {
            f: <Gallery/>,
            resizeHandles: availableHandles,
            x: 6,
            y: 0,
            w: 4,
            minW: 2,
            maxW: 4,
            h: 9,
            minH: 3,
            maxH: 12
        },
    ]);

    function switchMode() {
        setMode(!editMode);
    }  

    function retrieveConfig(user, space){
        const layoutConfig = {
            isDraggable: editMode,
            isResizable: editMode,
            items: 2,
            cols: 12,
            rowHeight: 30,
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
            <button onClick={switchMode} 
                    className = "size-12 absolute top-4 right-0 z-10 flex opacity-50 hover:opacity-100 duration-500 ">
                <RiPencilFill className="text-gray-700 font-semibold text-3xl"/>
            </button>
            <Space config={retrieveConfig(user, spaceID)} isEditable={editMode}></Space>
        </div>
    )
}