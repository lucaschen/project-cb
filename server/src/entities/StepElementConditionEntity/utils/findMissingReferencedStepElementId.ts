import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";

import getReferencedStepElementIds from "./getReferencedStepElementIds";

/**
 * Return the first referenced step element id missing from the provided valid
 * set, or `null` when the statement only references surviving elements.
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
