import type { buttonElementPropertiesType } from "@packages/shared/generated/elements/index";

type ButtonElementProps = {
  properties: buttonElementPropertiesType;
};

const buttonVariantClassNames: Record<string, string> = {
  ghost: "border border-white/10 bg-transparent text-slate-200",
  primary: "bg-sky-400 text-slate-950",
  secondary: "border border-slate-700 bg-slate-900/70 text-slate-100",
};

const ButtonElement = ({ properties }: ButtonElementProps) => (
  <button
    className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium ${
      buttonVariantClassNames[properties.variant] ?? buttonVariantClassNames.primary
    } ${properties.disabledWhenIncomplete ? "opacity-75" : ""}`}
    disabled
    type="button"
  >
    {properties.text}
  </button>
);

export default ButtonElement;
