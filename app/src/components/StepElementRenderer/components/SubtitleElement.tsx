import type { subtitleElementPropertiesType } from "@packages/shared/generated/elements/index";

type SubtitleElementProps = {
  properties: subtitleElementPropertiesType;
};

const SubtitleElement = ({ properties }: SubtitleElementProps) => (
  <p
    className="text-sm leading-6 text-slate-300"
    style={{
      textAlign:
        properties.align === "left" || properties.align === "right"
          ? properties.align
          : "center",
    }}
  >
    {properties.text}
  </p>
);

export default SubtitleElement;
