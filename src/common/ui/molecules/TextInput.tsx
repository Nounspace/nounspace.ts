import React from "react";
import { Input } from "../atoms/input";

const TextInput: React.FC = (props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
    ></Input>
  );
};

export default TextInput;