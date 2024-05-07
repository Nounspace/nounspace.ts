import React, { useState } from 'react';
import { RiPencilFill } from "react-icons/ri";
import Modal from "@/common/ui/components/Modal";

export default function Gallery() {
  const [editMode, setMode] = useState(false);
  const [imageURL, setImageURL] = useState("https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&h=1280&q=80");

  function switchMode() {
    setMode(!editMode);
  }

  const handleSubmit = (event) => {
    const formData = new FormData(event.currentTarget);
    event.preventDefault();
    setImageURL(formData.get("URL") as string);
    switchMode();
  };

  return (
    // TO DO: Change this to sit inside of the FidgetWrapper, which will handle the edit mode for the Fidget
    <>
      <div className ="row-span-4 col-span-4 rounded-md flex items-center justify-center overflow-hidden relative">
        <img
          src={`${imageURL}?${new Date().getTime()}`}
          className = "inset-0 bg-cover bg-center z-0"
        />
        <div className = "opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50">
          <button onClick={switchMode} className = "opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex justify-center items-center text-white font-semibold text-4xl">
            <RiPencilFill />
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