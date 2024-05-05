import { useState } from 'react';
import { RiPencilFill } from "react-icons/ri";
import { FaGear } from "react-icons/fa6";
import Modal from "@/common/ui/components/Modal";

export default function Gallery() {

  const images = ["image1","image2","image3"]

  const [editMode, setMode] = useState(false);
  const [imageURL, setImageURL] = useState("https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png");

  function switchMode() {
    setMode(!editMode);
  }

  const handleSubmit = (event) => {
    const formData = new FormData(event.currentTarget);
    event.preventDefault();
    setImageURL(formData.get("URL"));
    switchMode();
  };

  return (
    <>
      <div className ="bg-[image:var(--image-url)] rounded-md flex-1 items-center justify-center overflow-hidden relative bg-cover size-full"
            style={{'--image-url': `url(${imageURL})`}}
      >
        <div className = "flex items-center justify-center opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50">
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