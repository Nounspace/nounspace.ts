import { InputProps } from "@/common/components/atoms/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/atoms/tooltip";
import React, { forwardRef, useCallback, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import styled from "styled-components";

export interface TextInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  displayNameHint?: string;
}

const TextFieldRoot = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: ${({ isActive }) =>
    isActive ? "1px solid lightblue" : "1px solid lightgray"};
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
  const { displayNameHint, ...restProps } = props;

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
    <div className="flex items-center gap-2">
      <TextFieldRoot isActive={isActive}>
        <TextFieldInput
          {...restProps}
          ref={ref}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </TextFieldRoot>
      {displayNameHint && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <FaInfoCircle color="#D1D5DB" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-44">{displayNameHint}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
