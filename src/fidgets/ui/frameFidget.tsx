import { useState } from 'react';
import { FaGear } from "react-icons/fa6";
import Modal from "@/common/ui/components/Modal";
import Frame from '@/common/ui/molecules/Frame';

export default function FrameFidget({url}) {
    const images = ["image1","image2","image3"]

    const [editMode, setMode] = useState(false);
    const [frameURL, setFrameURL] = useState(url);
  
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
          <div className = "mb-24 flex items-center justify-center opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex bg-opacity-20 bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(0,0,0,0.40)_0%,rgba(255,255,255,0.00)_100%)]">
            <button onClick={switchMode} className = "absolute flex-1 size-1/12 opacity-50 hover:opacity-100 duration-500 z-10 flex justify-center items-center text-white font-semibold text-2xl">
              <FaGear />
            </button>
          </div>
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