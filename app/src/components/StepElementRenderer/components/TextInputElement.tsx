import type { textInputElementPropertiesType } from "@packages/shared/generated/elements/index";

type TextInputElementProps = {
  properties: textInputElementPropertiesType;
};

const previewFieldClassName =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white/90";

const TextInputElement = ({ properties }: TextInputElementProps) => (
  <input
    aria-label="Text input preview"
    className={`${previewFieldClassName} ${properties.required ? "border-sky-300/30" : ""}`}
    placeholder={properties.placeholder ?? "Enter text"}
    readOnly
    value=""
  />
);

export default TextInputElement;
