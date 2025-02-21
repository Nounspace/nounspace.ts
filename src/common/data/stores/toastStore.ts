import { create } from "zustand";

interface ToastState {
  isDisplayed: boolean;
  message: string;
  duration: number;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isDisplayed: false,
  message: "",
  duration: 5000,
  showToast: (message: string, duration: number = 5000) =>
    set({ isDisplayed: true, message, duration }),
  hideToast: () => set({ isDisplayed: false, message: "" }),
}));
