import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  isBusy?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-400 text-slate-950 hover:bg-sky-300 focus-visible:outline-sky-300 disabled:bg-slate-700 disabled:text-slate-300",
  secondary:
    "border border-slate-700 bg-slate-900/70 text-slate-100 hover:border-sky-300/40 hover:bg-slate-900 focus-visible:outline-sky-300 disabled:border-slate-800 disabled:text-slate-500",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white focus-visible:outline-sky-300 disabled:text-slate-500",
};

export const Button = ({
  children,
  className = "",
  disabled,
  isBusy = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      disabled={disabled || isBusy}
      type={type}
      {...props}
    >
      {isBusy ? "Working..." : children}
    </button>
  );
};
