import { useState } from 'react';
import { FaGear } from "react-icons/fa6";
import Modal from "@/common/ui/components/Modal";
import Frame from '@/common/ui/molecules/Frame';

export default function FrameFidget() {
    const images = ["image1","image2","image3"]

    const [editMode, setMode] = useState(false);
    const [frameURL, setFrameURL] = useState("https://far.cards/api/trade/user/4865");
  
    function switchMode() {
      setMode(!editMode);
    }
  
    const handleSubmit = (event) => {
      const formData = new FormData(event.currentTarget);
      event.preventDefault();
      setFrameURL(formData.get("URL"));
      switchMode();
    };
  
    return (
      <>
        <div className ="rounded-md flex-1 items-center justify-center overflow-hidden relative bg-contain">
          <Frame url = { frameURL }/>
            <button onClick={switchMode} className = "size-1/12 opacity-50 hover:opacity-100 duration-500 z-10 flex justify-center items-center text-white font-semibold text-2xl">
                <FaGear />
            </button>
        </div>
        <Modal
          open={editMode}
          setOpen={setMode}
        >
          <form onSubmit={handleSubmit}>
            <label>
              <h2 className = "m-2">URL</h2>            
              <input name="URL" type="text" className = "p-2 m-2"/>
            </label>
            <br/>
            <button type="submit" className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded">
              Update
            </button>
          </form>
        </Modal>
      </>
    )
}