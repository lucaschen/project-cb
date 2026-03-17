import type { datePickerElementPropertiesType } from "@packages/shared/generated/elements/index";

type DatePickerElementProps = {
  properties: datePickerElementPropertiesType;
};

const previewFieldClassName =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white/90";

const DatePickerElement = ({ properties }: DatePickerElementProps) => (
  <input
    aria-label="Date input preview"
    className={`${previewFieldClassName} ${properties.required ? "border-sky-300/30" : ""}`}
    placeholder={properties.format ?? "YYYY-MM-DD"}
    readOnly
    type="text"
    value=""
  />
);

export default DatePickerElement;
