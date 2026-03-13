import { ElementPropertyTypes } from "@packages/shared/types/enums";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

/**
 * Normalize a submitted property value into the string storage format used by
 * `StepElementProperties.propertyValue`.
 */
export default function serializeStepElementPropertyValue(
  rawValue: unknown,
  propertyType: ElementPropertyTypes,
): string {
  switch (propertyType) {
    case ElementPropertyTypes.STRING: {
      if (typeof rawValue !== "string") {
        throw new InvalidRequestError("Expected a string property value.");
      }

      return rawValue;
    }
    case ElementPropertyTypes.NUMBER: {
      const parsedNumber =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : Number.NaN;

      if (!Number.isFinite(parsedNumber)) {
        throw new InvalidRequestError(
          "Expected a finite numeric property value.",
        );
      }

      return `${rawValue}`;
    }
    case ElementPropertyTypes.BOOLEAN: {
      if (typeof rawValue === "boolean") {
        return rawValue ? "true" : "false";
      }

      if (rawValue === "true" || rawValue === "false") {
        return rawValue;
      }

      throw new InvalidRequestError("Expected a boolean property value.");
    }
    case ElementPropertyTypes.ARRAY: {
      if (!Array.isArray(rawValue)) {
        throw new InvalidRequestError("Expected an array property value.");
      }

      return JSON.stringify(rawValue);
    }
    case ElementPropertyTypes.OBJECT: {
      if (
        !rawValue ||
        typeof rawValue !== "object" ||
        Array.isArray(rawValue)
      ) {
        throw new InvalidRequestError("Expected an object property value.");
      }

      return JSON.stringify(rawValue);
    }
    default: {
      const exhaustiveCheck: never = propertyType;
      throw new InvalidRequestError(
        `Unsupported property type: ${exhaustiveCheck}`,
      );
    }
  }
}
