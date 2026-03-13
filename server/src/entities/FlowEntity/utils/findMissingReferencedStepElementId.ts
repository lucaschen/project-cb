import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";

import getReferencedStepElementIds from "~entities/StepEntity/utils/getReferencedStepElementIds";

/**
 * Return the first referenced step element id that is not present in the
 * provided surviving-id set, or `null` when all references are valid.
 */
export default function findMissingReferencedStepElementId({
  statement,
  validStepElementIds,
}: {
  statement: ConditionStatement;
  validStepElementIds: Set<string>;
}): string | null {
  return (
    getReferencedStepElementIds(statement).find(
      (stepElementId) => !validStepElementIds.has(stepElementId),
    ) ?? null
  );
}
