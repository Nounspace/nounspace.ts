"use client";

import { InputProps } from "@/common/components/atoms/input";
import React, { forwardRef, useCallback, useState } from "react";
import styled from "styled-components";

export interface TextInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const TextFieldRoot = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: ${({ $isActive }) =>
    $isActive ? "1px solid lightblue" : "1px solid lightgray"};
  border-radius: 4px;
  width: 100%;
`;

const TextFieldInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 5px;
`;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const [isActive, setIsActive] = useState(false);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(event.target.value);
    },
    [props.onChange],
  );

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <TextFieldRoot $isActive={isActive}>
      <TextFieldInput
        {...props}
        ref={ref}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </TextFieldRoot>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
