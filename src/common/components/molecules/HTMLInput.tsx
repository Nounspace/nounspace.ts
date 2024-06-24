import React, { forwardRef, useCallback } from "react";
import { Textarea, TextareaProps } from "../atoms/textarea";

export interface HTMLInputProps extends Omit<TextareaProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const HTMLInput = forwardRef<HTMLTextAreaElement, HTMLInputProps>(
  (props, ref) => {
    const onChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
      (event) => {
        props.onChange?.(event.target.value);
      },
      [props.onChange],
    );

    return (
      <Textarea
        {...props}
        ref={ref}
        value={props.value ?? ""}
        className="min-h-24 resize-y"
        onChange={onChange}
      />
    );
  },
);

HTMLInput.displayName = "HTMLInput";

export default HTMLInput;
