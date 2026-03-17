import type { headerElementPropertiesType } from "@packages/shared/generated/elements/index";

type HeaderElementProps = {
  properties: headerElementPropertiesType;
};

const HeaderElement = ({ properties }: HeaderElementProps) => (
  <h2
    className="text-2xl font-semibold tracking-tight text-white"
    style={{
      textAlign:
        properties.align === "left" || properties.align === "right"
          ? properties.align
          : "center",
    }}
  >
    {properties.text}
  </h2>
);

export default HeaderElement;
