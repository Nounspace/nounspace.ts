import React, { memo, useCallback } from "react";
import { Button } from "@/common/components/atoms/button";

interface CardButtonProps {
  label: string;
  onClick: (section: string) => void;
  isActive: boolean;
  section: string;
}

const CardButton: React.FC<CardButtonProps> = memo(
  ({ label, onClick, isActive, section }) => {
    const handleClick = useCallback(() => {
      onClick(section);
    }, [onClick, section]);

    return (
      <Button
        variant="outline"
        size="md"
        onClick={handleClick}
        className={`rounded-full text-slate-600 ${
          isActive ? "bg-slate-100 text-slate-700 border-slate-300" : ""
        }`}
      >
        {label}
      </Button>
    );
  }
);

CardButton.displayName = "CardButton";

export default CardButton;
