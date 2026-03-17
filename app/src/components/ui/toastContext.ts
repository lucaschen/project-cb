import { createContext } from "react";

export type ToastTone = "error" | "info" | "success";

export type ToastOptions = {
  duration?: number;
};

export type ToastApi = {
  dismiss: (id: number) => void;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  success: (message: string, options?: ToastOptions) => number;
};

export const ToastContext = createContext<ToastApi | null>(null);
