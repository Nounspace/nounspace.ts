import React from "react";
import _ from "lodash";
import { useState, useEffect, useCallback } from "react";

const inputValue = (e: any): string => e.target.value;

const EditableText = ({ initialText, updateMethod }) => {
  const [isEditing, setisEditing] = useState(false);
  const [text, settext] = useState(initialText);
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset text when initialText changes (important for tab name updates)
  useEffect(() => {
    if (!isEditing) {
      settext(initialText);
    }
  }, [initialText, isEditing]);

  const onEditEnd = useCallback(async () => {
    if (isProcessing) return; // Prevent double processing
    
    setisEditing(false);
    setIsProcessing(true);
    
    try {
      // Don't update if text hasn't changed
      if (text === initialText) {
        return;
      }

      // Add basic validation
      if (!text || text.trim().length === 0) {
        console.warn("Tab name cannot be empty");
        settext(initialText); // Reset to original text
        return;
      }

      const trimmedText = text.trim();

      // Validate characters
      if (/[^a-zA-Z0-9-_ ]/.test(trimmedText)) {
        console.warn("Invalid characters in tab name");
        setHasError(true);
        settext(initialText); // Reset to original text
        setTimeout(() => setHasError(false), 3000); // Clear error after 3s
        return;
      }

      // Call the update method safely
      if (updateMethod && typeof updateMethod === 'function') {
        await updateMethod(initialText, trimmedText);
      }
    } catch (error) {
      console.error("Failed to update tab name:", error);
      setHasError(true);
      settext(initialText); // Reset to original text on error
      setTimeout(() => setHasError(false), 3000); // Clear error after 3s
    } finally {
      setIsProcessing(false);
    }
  }, [text, initialText, updateMethod, isProcessing]);

  const onEditCancel = useCallback(() => {
    setisEditing(false);
    settext(initialText); // Reset to original text
    setHasError(false);
    setIsProcessing(false);
  }, [initialText]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isProcessing) return; // Prevent actions while processing
    
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      onEditEnd();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onEditCancel();
    }
  }, [onEditEnd, onEditCancel, isProcessing]);

  const handleDoubleClick = useCallback(() => {
    if (!isProcessing) {
      setisEditing(true);
    }
  }, [isProcessing]);

  if (isEditing) {
    return (
      <input
        value={text}
        className={`bg-transparent border-none ${hasError ? 'text-red-500' : ''} ${isProcessing ? 'opacity-50' : ''}`}
        maxLength={22}
        onKeyDown={handleKeyDown}
        onChange={_.flow(inputValue, settext)}
        onBlur={onEditEnd}
        autoFocus
        disabled={isProcessing}
      />
    );
  }

  return (
    <div 
      className={`select-none ${hasError ? 'text-red-500' : ''} ${isProcessing ? 'opacity-50' : ''}`} 
      onDoubleClick={handleDoubleClick}
    >
      {text}
    </div>
  );
};

export default EditableText;
