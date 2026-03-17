import { X } from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "./Button";

type ModalProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  size?: "lg" | "xl";
  title: string;
};

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));

const Modal = ({
  actions,
  children,
  description,
  isOpen,
  onClose,
  size = "lg",
  title,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = panelRef.current
      ? getFocusableElements(panelRef.current)
      : [];

    focusables[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm">
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div
        className={`relative z-[101] flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-[0_40px_120px_rgba(2,6,23,0.55)] ${
          size === "xl" ? "max-w-[1320px]" : "max-w-[1040px]"
        }`}
        onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Delete" || event.key === "Backspace") {
            event.stopPropagation();
          }

          if (event.key !== "Tab" || !panelRef.current) {
            return;
          }

          const focusables = getFocusableElements(panelRef.current);

          if (focusables.length === 0) {
            return;
          }

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{title}</p>
            {description ? (
              <p className="text-sm leading-5 text-slate-400">{description}</p>
            ) : null}
          </div>
          <Button
            className="h-10 w-10 shrink-0 px-0"
            onClick={onClose}
            variant="secondary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        {actions ? (
          <div className="border-t border-white/10 px-6 py-4">{actions}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
