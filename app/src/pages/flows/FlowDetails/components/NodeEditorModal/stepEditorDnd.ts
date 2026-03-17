import type { UniqueIdentifier } from "@dnd-kit/core";

const STEP_EDITOR_INSERTION_ZONE_PREFIX = "step-editor-insert:";

export const getInsertionZoneId = (index: number) =>
  `${STEP_EDITOR_INSERTION_ZONE_PREFIX}${index}`;

export const getInsertionIndex = (id: UniqueIdentifier | null | undefined) => {
  if (typeof id !== "string" || !id.startsWith(STEP_EDITOR_INSERTION_ZONE_PREFIX)) {
    return null;
  }

  const parsedIndex = Number(id.slice(STEP_EDITOR_INSERTION_ZONE_PREFIX.length));

  return Number.isInteger(parsedIndex) ? parsedIndex : null;
};
