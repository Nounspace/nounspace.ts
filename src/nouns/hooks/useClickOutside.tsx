"use client";
import { RefObject, useEffect } from "react";

interface UseClickOutsideParams {
  ref: RefObject<HTMLElement | null>;
  onClickOutside: () => void;
}

export default function useClickOutside({ ref, onClickOutside }: UseClickOutsideParams) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    }

    return () => {
      document.removeEventListener("mouseDown", handleClickOutside);
    };
  }, [ref, onClickOutside]);
}
