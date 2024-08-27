import React from "react";
import _ from "lodash";
import { useState } from "react";

const inputValue = (e: any): string => e.target.value;

function isEnterOrEscapeKeyEvent(event: React.KeyboardEvent<HTMLInputElement>) {
  return event.key === "Enter" || event.key === "Escape";
}

const EditableText = ({ initialText, updateMethod }) => {
  const [isEditing, setisEditing] = useState(false);
  const [text, settext] = useState(initialText);

  const onEditEnd = () => {
    setisEditing(false);
    updateMethod(initialText, text);
  };

  return isEditing ? (
    <input
      value={text}
      className="bg-transparent border-none"
      onKeyDown={(event) => {
        if (isEnterOrEscapeKeyEvent(event)) {
          event.preventDefault();
          event.stopPropagation();
          onEditEnd();
        }
      }}
      onChange={_.flow(inputValue, settext)}
      onBlur={onEditEnd}
      autoFocus
    />
  ) : (
    <div className="select-none" onDoubleClick={() => setisEditing(true)}>
      {text}
    </div>
  );
};

export default EditableText;
