import type { labelElementPropertiesType } from "@packages/shared/generated/elements/index";

type LabelElementProps = {
  properties: labelElementPropertiesType;
};

const LabelElement = ({ properties }: LabelElementProps) => (
  <label className="text-sm font-medium text-slate-200">{properties.text}</label>
);

export default LabelElement;
