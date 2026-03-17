import type { textareaElementPropertiesType } from "@packages/shared/generated/elements/index";

type TextareaElementProps = {
  properties: textareaElementPropertiesType;
};

const previewFieldClassName =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white/90";

const previewLabelClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

const TextareaElement = ({ properties }: TextareaElementProps) => (
  <div className="space-y-2">
    <div className={previewLabelClassName}>{properties.label}</div>
    <textarea
      className={`${previewFieldClassName} min-h-28 resize-none`}
      readOnly
      rows={4}
      value=""
    />
  </div>
);

export default TextareaElement;
