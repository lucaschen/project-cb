import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";

export type StepElementDraft = Omit<HydratedStepElementType, "properties"> & {
  properties: Array<HydratedStepElementType["properties"][number]>;
};
