import React from "react";
import { Button } from "@/common/components/atoms/button";
import { FaList, FaThLarge } from "react-icons/fa";

export type ViewMode = "list" | "grid";

export type SwitchButtonProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

const SwitchButton: React.FC<SwitchButtonProps> = ({ value, onChange }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newValue = value === "list" ? "grid" : "list";
    onChange(newValue);
  };

  return (
    <Button onClick={handleClick} className="flex items-center">
      {value === "list" ? (
        <>
          <FaList className="mr-2" />
          List View
        </>
      ) : (
        <>
          <FaThLarge className="mr-2" />
          Grid View
        </>
      )}
    </Button>
  );
};

export default SwitchButton;
