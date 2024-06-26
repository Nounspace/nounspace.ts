import React, { forwardRef, useCallback } from "react";
import { Textarea, TextareaProps } from "@/common/components/atoms/textarea";

export interface CSSInputProps extends Omit<TextareaProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const CSSInput = forwardRef<HTMLTextAreaElement, CSSInputProps>(
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

CSSInput.displayName = "CSSInput";

export default CSSInput;
