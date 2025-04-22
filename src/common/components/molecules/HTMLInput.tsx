import React, { forwardRef, useCallback, useRef, useEffect } from "react";
import { Textarea, TextareaProps } from "@/common/components/atoms/textarea";

export interface HTMLInputProps extends Omit<TextareaProps, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
}

const HTMLInput = forwardRef<HTMLTextAreaElement, HTMLInputProps>(
  (props, ref) => {
    // Use a local ref to maintain a reference to the most recent value
    const internalValueRef = useRef<string>(props.value ?? "");
    // Internal state change handler - keeps internal value up to date
    const onChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
      (event) => {
        const newValue = event.target.value;
        internalValueRef.current = newValue;
        props.onChange?.(newValue);
      },
      [props.onChange],
    );
    
    // Keep internal ref in sync with external value
    useEffect(() => {
      if (props.value !== undefined) {
        internalValueRef.current = props.value;
      }
    }, [props.value]);

    return (
      <Textarea
        {...props}
        ref={ref}
        // Use internal ref value rather than just the prop
        value={internalValueRef.current}
        className="min-h-24 resize-y"
        onChange={onChange}
      />
    );
  },
);

HTMLInput.displayName = "HTMLInput";

export default HTMLInput;
