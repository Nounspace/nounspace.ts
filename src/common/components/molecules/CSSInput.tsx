import React, { forwardRef, useCallback, useState } from "react";
import styled from "styled-components";
import { TextareaProps } from "@/common/components/atoms/textarea";

export interface CSSInputProps extends Omit<TextareaProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const TextareaRoot = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: ${({ $isActive }) => ($isActive ? "1px solid lightblue" : "1px solid lightgray")};
  padding: 5px;
  border-radius: 4px;
  width: 100%;
`;

const TextareaInput = styled.textarea`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 5px;
  resize: vertical;
  min-height: 100px;
`;

const CSSInput = forwardRef<HTMLTextAreaElement, CSSInputProps>((props, ref) => {
  const [isActive, setIsActive] = useState(false);

  const onChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (event) => {
      props.onChange?.(event.target.value);
    },
    [props.onChange]
  );

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <TextareaRoot $isActive={isActive}>
      <TextareaInput
        {...props}
        ref={ref}
        value={props.value ?? ""}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </TextareaRoot>
  );
});

CSSInput.displayName = "CSSInput";

export default CSSInput;
