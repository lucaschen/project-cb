import { ElementPropertyTypes } from "@packages/shared/types/enums";

/**
 * Check whether the persisted default value is valid enough to satisfy a
 * required property when the client omits an explicit override.
 */
export default function defaultValueSatisfiesStepElementProperty(
  defaultValue: string,
  propertyType: ElementPropertyTypes,
): boolean {
  try {
    switch (propertyType) {
      case ElementPropertyTypes.STRING:
        return true;
      case ElementPropertyTypes.NUMBER:
        return Number.isFinite(Number(defaultValue));
      case ElementPropertyTypes.BOOLEAN:
        return defaultValue === "true" || defaultValue === "false";
      case ElementPropertyTypes.ARRAY: {
        const parsed = JSON.parse(defaultValue);
        return Array.isArray(parsed);
      }
      case ElementPropertyTypes.OBJECT: {
        const parsed = JSON.parse(defaultValue);
        return (
          Boolean(parsed) &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        );
      }
      default: {
        return false;
      }
    }
  } catch {
    return false;
  }
}
