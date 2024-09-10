import React, { forwardRef, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { TextareaProps } from "@/common/components/atoms/textarea";
import { Box } from "@mui/material";
import { Button } from "../atoms/button";

export interface CSVInputProps extends Omit<TextareaProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const TextareaRoot = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: ${({ isActive }) =>
    isActive ? "1px solid lightblue" : "1px solid lightgray"};
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

const HiddenFileInput = styled.input`
  display: none;
`;

const CSVInput = forwardRef<HTMLTextAreaElement, CSVInputProps>(
  (props, ref) => {
    const [isActive, setIsActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
      (event) => {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          props.onChange?.(text);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        };
        reader.readAsText(file);
      }
    };

    return (
      <Box>
        <TextareaRoot isActive={isActive}>
          <TextareaInput
            {...props}
            ref={ref}
            value={props.value ?? ""}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </TextareaRoot>
        <HiddenFileInput
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          id="csvFileInput"
          ref={fileInputRef}
        />
        <label
          htmlFor="csvFileInput"
          className="w-full mt-2 cursor-pointer inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-200 hover:bg-gray-300 active:bg-gray-300 h-10 px-4 rounded-md py-2 text-md flex-1"
        >
          Upload CSV
        </label>
      </Box>
    );
  },
);

CSVInput.displayName = "CSVInput";

export default CSVInput;
