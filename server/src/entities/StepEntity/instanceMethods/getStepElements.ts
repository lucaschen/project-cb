import type StepEntity from "../StepEntity";

export default async function getStepElements(
  this: StepEntity,
): Promise<unknown[]> {
  // This method should use StepElementEntity's static methods to get related data
  // For now, we'll return an empty array as we need to implement proper entity access
  // In a real implementation, this would call StepElementEntity.findByStepId()
  return [];
}
