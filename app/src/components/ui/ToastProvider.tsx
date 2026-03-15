import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { PropsWithChildren } from "react";

type ToastTone = "error" | "info" | "success";

type ToastOptions = {
  duration?: number;
};

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastApi = {
  dismiss: (id: number) => void;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  success: (message: string, options?: ToastOptions) => number;
};

const DEFAULT_DURATION_MS = 4000;

const ToastContext = createContext<ToastApi | null>(null);

const toneConfig: Record<
  ToastTone,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    panelClassName: string;
    title: string;
  }
> = {
  error: {
    icon: AlertCircle,
    iconClassName: "text-rose-300",
    panelClassName: "border-rose-300/20 bg-rose-300/10",
    title: "Error",
  },
  info: {
    icon: Info,
    iconClassName: "text-sky-300",
    panelClassName: "border-sky-300/20 bg-sky-300/10",
    title: "Notice",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-300",
    panelClassName: "border-emerald-300/20 bg-emerald-300/10",
    title: "Success",
  },
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextToastId = useRef(0);
  const timeoutRefs = useRef<Set<number>>(new Set());

  const dismiss = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const id = ++nextToastId.current;

      setToasts((currentToasts) => [...currentToasts, { id, message, tone }]);

      const timeoutId = window.setTimeout(() => {
        timeoutRefs.current.delete(timeoutId);
        dismiss(id);
      }, options?.duration ?? DEFAULT_DURATION_MS);

      timeoutRefs.current.add(timeoutId);

      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastApi>(
    () => ({
      dismiss,
      error: (message, options) => showToast("error", message, options),
      info: (message, options) => showToast("info", message, options),
      success: (message, options) => showToast("success", message, options),
    }),
    [dismiss, showToast],
  );

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[120] flex justify-end px-4 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => {
            const config = toneConfig[toast.tone];
            const Icon = config.icon;

            return (
              <div
                className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_48px_rgba(2,6,23,0.45)] backdrop-blur ${config.panelClassName}`}
                key={toast.id}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClassName}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {config.title}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-100">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    aria-label="Dismiss notification"
                    className="rounded-full p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                    onClick={() => dismiss(toast.id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
};
