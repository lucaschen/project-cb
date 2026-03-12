import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  helperText?: string;
  label: string;
};

export const FormField = ({
  error,
  helperText,
  id,
  label,
  type = "text",
  ...props
}: FormFieldProps) => {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-slate-100">{label}</span>
      <input
        className={`w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 ${
          error ? "border-rose-400/70" : "border-slate-700"
        }`}
        id={id}
        type={type}
        {...props}
      />
      {error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-slate-400">{helperText}</p>
      ) : null}
    </label>
  );
};
