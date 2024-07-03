import React, { useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";

interface MDeditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MDeditor: React.FC<MDeditorProps> = ({ value, onChange }) => {
  const [markdown, setMarkdown] = useState(value);

  const handleEditorChange = (val?: string) => {
    const updatedValue = val || "";
    setMarkdown(updatedValue);
    onChange(updatedValue);
  };

  return (
    <div className="w-full h-full" data-color-mode="light">
      <MDEditor
        value={markdown}
        onChange={handleEditorChange}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
        ]}
        height="600px"
        preview="edit"
        style={{
          height: "100%",
          width: "100%",
          overflow: "auto",
          border: "1px solid var(--user-theme-fidget-border-color)",
          borderRadius: "5px",
        }}
      />
    </div>
  );
};

export default MDeditor;
