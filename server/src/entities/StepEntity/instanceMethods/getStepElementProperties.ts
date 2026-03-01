import type StepEntity from "../StepEntity";

export default async function getStepElementProperties(
  this: StepEntity,
  stepElementId: string,
): Promise<unknown[]> {
  // This method should use StepElementPropertiesEntity's static methods to get related data
  // For now, we'll return an empty array as we need to implement proper entity access
  // In a real implementation, this would call StepElementPropertiesEntity.findByStepElementId()
  return [];
}
