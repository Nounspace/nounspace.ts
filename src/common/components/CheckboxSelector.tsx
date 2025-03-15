import React from "react";

const CheckboxSelector: React.FC<{
  onChange: (value: boolean) => void;
  value: boolean;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className={className}
    />
  );
};

export default CheckboxSelector;