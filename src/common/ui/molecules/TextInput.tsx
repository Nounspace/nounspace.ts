import React, { forwardRef, useCallback } from "react";
import { Input, InputProps } from "@/common/ui/atoms/input";

export interface TextInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange?: (value: string) => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(event.target.value);
    },
    [props.onChange]
  );

  return (
    <Input
      {...props}
      ref={ref}
      onChange={onChange}
    />
  );
});

export default TextInput;