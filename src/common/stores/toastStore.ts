import { create } from 'zustand';

interface ToastStore {
  showToast: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  showToast: (message: string, duration = 3000) => {
    // You can implement the actual toast logic here
    // For now, we'll just use console.log
    console.log(`Toast: ${message}`);
    
    // Clear the toast after duration
    setTimeout(() => {
      // Clear toast logic here
    }, duration);
  },
})); 
