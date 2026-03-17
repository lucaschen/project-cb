import type { selectElementPropertiesType } from "@packages/shared/generated/elements/index";

type SelectElementProps = {
  properties: selectElementPropertiesType;
};

const previewFieldClassName =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white/90";

const getOptionLabel = (option: unknown) => {
  if (typeof option === "string" || typeof option === "number" || typeof option === "boolean") {
    return String(option);
  }

  if (option && typeof option === "object") {
    const optionRecord = option as Record<string, unknown>;

    if (typeof optionRecord.label === "string") {
      return optionRecord.label;
    }

    if (typeof optionRecord.name === "string") {
      return optionRecord.name;
    }

    if (
      typeof optionRecord.value === "string" ||
      typeof optionRecord.value === "number" ||
      typeof optionRecord.value === "boolean"
    ) {
      return String(optionRecord.value);
    }

    return JSON.stringify(option);
  }

  return String(option);
};

const getOptionValue = (option: unknown) => {
  if (typeof option === "string" || typeof option === "number" || typeof option === "boolean") {
    return String(option);
  }

  if (option && typeof option === "object") {
    const optionRecord = option as Record<string, unknown>;

    if (
      typeof optionRecord.value === "string" ||
      typeof optionRecord.value === "number" ||
      typeof optionRecord.value === "boolean"
    ) {
      return String(optionRecord.value);
    }
  }

  return getOptionLabel(option);
};

const SelectElement = ({ properties }: SelectElementProps) => (
  <select
    aria-label="Select preview"
    className={`${previewFieldClassName} ${properties.required ? "border-sky-300/30" : ""}`}
    multiple={properties.multiple ?? false}
    value=""
    onChange={() => undefined}
  >
    <option value="" disabled>
      {properties.options.length > 0 ? "Choose an option" : "No options configured"}
    </option>
    {properties.options.map((option) => (
      <option key={`${getOptionValue(option)}-${getOptionLabel(option)}`} value={getOptionValue(option)}>
        {getOptionLabel(option)}
      </option>
    ))}
  </select>
);

export default SelectElement;
