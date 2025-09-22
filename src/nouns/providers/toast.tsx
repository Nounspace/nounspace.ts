"use client";
import { createContext, useCallback, useState, useEffect } from "react";

const TOAST_TIMEOUT_MS = 3000;
let id = 0;

export enum ToastType {
  Success,
  Failure,
  Pending,
}

export interface ToastConfig {
  content: React.ReactNode;
  type: ToastType;
}

export interface Toast {
  id: number;
  config: ToastConfig;
  timeoutId?: NodeJS.Timeout;
}

interface ToastContextType {
  toasts: Toast[];
  addToast?: (config: ToastConfig) => number;
  removeToast?: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: undefined,
  removeToast: undefined,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((toasts) => {
      const toast = toasts.find((t) => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return toasts.filter((t) => t.id !== id);
    });
  }, []);

  const addToast = useCallback(
    (config: ToastConfig) => {
      const _id = id++;

      let timeoutId: NodeJS.Timeout | undefined = undefined;
      if (config.type != ToastType.Pending) {
        timeoutId = setTimeout(() => removeToast(_id), TOAST_TIMEOUT_MS);
      }
      setToasts((toasts) => [...toasts, { id: _id, config, timeoutId }]);

      return _id;
    },
    [setToasts, removeToast],
  );

  useEffect(() => {
    return () => {
      toasts.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
