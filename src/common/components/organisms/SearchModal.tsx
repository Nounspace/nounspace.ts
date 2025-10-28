import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import { Dialog, DialogContent } from "@/common/components/atoms/dialog";

import SearchAutocompleteInput from "@/common/components/organisms/SearchAutocompleteInput";

export type SearchModalHandle = {
  focus: () => void;
};

type SearchModalProps = {
  onResultSelect?: () => void;
};

const SearchModal = React.forwardRef<SearchModalHandle, SearchModalProps>(
  ({ onResultSelect }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleSelect = useCallback(() => {
      handleBlur();
      onResultSelect?.();
    }, [handleBlur, onResultSelect]);

    useImperativeHandle(
      ref,
      () => ({
        focus: handleFocus,
      }),
      [handleFocus],
    );

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
          <SearchAutocompleteInput onSelect={handleSelect} />
        </DialogContent>
      </Dialog>
    );
  },
);

SearchModal.displayName = "SearchModal";

export default SearchModal;
