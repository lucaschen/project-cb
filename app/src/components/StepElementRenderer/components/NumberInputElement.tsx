import type { numberInputElementPropertiesType } from "@packages/shared/generated/elements/index";

type NumberInputElementProps = {
  properties: numberInputElementPropertiesType;
};

const previewFieldClassName =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white/90";

const previewLabelClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

const NumberInputElement = ({ properties }: NumberInputElementProps) => (
  <div className="space-y-2">
    <div className={previewLabelClassName}>
      {properties.label}
      {properties.required ? " *" : ""}
    </div>
    <input
      className={previewFieldClassName}
      max={properties.max}
      min={properties.min}
      placeholder={properties.format ?? "0"}
      readOnly
      type="number"
      value=""
    />
  </div>
);

export default NumberInputElement;
