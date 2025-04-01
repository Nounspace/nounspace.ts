"use client";

import { create } from "zustand";

const loadClosedForeverKeys = (): Set<string> => {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  const data = localStorage.getItem("closedForeverToasts");
  return data ? new Set(JSON.parse(data)) : new Set();
};

const saveClosedForeverKeys = (keys: Set<string>) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem("closedForeverToasts", JSON.stringify(Array.from(keys)));
};

interface ToastState {
  isDisplayed: boolean;
  message: string;
  duration: number;
  toastKey?: string;
  closeForever?: boolean;
  showToast: (
    message: string,
    duration?: number,
    toastKey?: string,
    closeForever?: boolean,
  ) => void;
  hideToast: () => void;
  closedForeverKeys: Set<string>;
}

export const useToastStore = create<ToastState>((set, get) => ({
  isDisplayed: false,
  message: "",
  duration: 5000,
  toastKey: undefined,
  closeForever: undefined,
  closedForeverKeys: loadClosedForeverKeys(),
  showToast: (message, duration = 5000, toastKey, closeForever) => {
    if (toastKey && get().closedForeverKeys.has(toastKey)) {
      return;
    }
    set({ isDisplayed: true, message, duration, toastKey, closeForever });
  },
  hideToast: () => {
    set((state) => {
      if (state.toastKey && state.closeForever) {
        const newKeys = new Set(state.closedForeverKeys);
        newKeys.add(state.toastKey);
        saveClosedForeverKeys(newKeys);
        return {
          closedForeverKeys: newKeys,
          isDisplayed: false,
          message: "",
        };
      }
      return { isDisplayed: false, message: "" };
    });
  },
}));
