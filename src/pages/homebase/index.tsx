import Space from "@/common/ui/templates/space";
import { useAccountStore } from "@/common/data/stores/useAccountStore";
import { useState } from 'react';
import { RiPencilFill } from "react-icons/ri";
import Gallery from "@/fidgets/ui/gallery";
import Feed from "@/pages/feed";

export default function Homebase(spaceID) {
    function retrieveConfig(user, space){

        const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

        const fidgetConfigs = [
            {
                x: 0,
                y: 0,
                w: 6,
                h: 20,
                f: <Feed/>,
                resizeHandles: editMode ? availableHandles : [],
                minW: 4,
                maxW: 8,
                minH: 10,
                maxH: 20
            },
            {
                f: <Gallery/>,
                resizeHandles: editMode ? availableHandles : [],
                x: 6,
                y: 0,
                w: 4,
                minW: 2,
                maxW: 4,
                h: 9,
                minH: 3,
                maxH: 12
            },
        ];

        const layoutConfig = {
            isDraggable: true,
            isResizable: true,
            items: 2,
            rowHeight: 30,
            onLayoutChange: function() {},
            cols: 12
        };
        const layoutID = "";
    
        return ({fidgetConfigs, layoutConfig, layoutID})
    }
    
    const images = ["image1","image2","image3"]
    
    const [editMode, setMode] = useState(false);
    const [imageURL, setImageURL] = useState("https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&h=1280&q=80");
    
    function switchMode() {
      setMode(!editMode);
    }

   //const { getCurrentUser } = useAccountStore();
    const user = useAccountStore.getState().accounts[0];

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