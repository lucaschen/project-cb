import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";

type StepElementValueSelector = {
  stepElementId: string;
  type: "stepElementValue";
};

type StepElementReferenceSearchValue =
  | boolean
  | ConditionStatement
  | null
  | number
  | Record<string, unknown>
  | string
  | StepElementReferenceSearchValue[]
  | undefined;

const isSearchRecord = (
  value: StepElementReferenceSearchValue,
): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const isStepElementValueSelector = (
  value: Record<string, unknown>,
): value is Record<string, unknown> & StepElementValueSelector => {
  return (
    value.type === "stepElementValue" &&
    typeof value.stepElementId === "string"
  );
};

/**
 * Walk a persisted condition statement and collect every referenced
 * `stepElementValue.stepElementId`, regardless of nesting depth.
 */
export default function getReferencedStepElementIds(
  value: StepElementReferenceSearchValue,
): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => getReferencedStepElementIds(entry));
  }

  if (!isSearchRecord(value)) {
    return [];
  }

  if (isStepElementValueSelector(value)) {
    return [value.stepElementId];
  }

  return Object.values(value).flatMap((entry) =>
    getReferencedStepElementIds(entry as StepElementReferenceSearchValue),
  );
}
