import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import { Dialog, DialogContent } from "@/common/components/atoms/dialog";

import SearchAutocompleteInput from "@/common/components/organisms/SearchAutocompleteInput";

const SearchModal = React.forwardRef((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback((hash?: string, username?: string) => {
    setIsFocused(false);
  }, []);

  useImperativeHandle(ref, () => ({
    focus: handleFocus,
  }));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        setIsFocused((open) => !open);
      }
      if (e.key === "Escape") {
        setIsFocused(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={isFocused} onOpenChange={setIsFocused}>
      <DialogContent className="p-0 border-none">
        <SearchAutocompleteInput onSelect={handleBlur} />
      </DialogContent>
    </Dialog>
  );
});

SearchModal.displayName = "SearchModal";

export default SearchModal;
