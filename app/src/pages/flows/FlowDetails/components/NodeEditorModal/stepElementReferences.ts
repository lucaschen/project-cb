import type { StepElementDraft } from "./stepEditorTypes";

export const getElementPropertyValue = (
  element: Pick<StepElementDraft, "properties">,
  propertyName: string,
) =>
  element.properties.find((property) => property.propertyName === propertyName)?.value ?? "";

export const getElementReferenceName = (
  element: Pick<StepElementDraft, "properties">,
) => {
  const nameValue = getElementPropertyValue(element, "name").trim();

  return nameValue.length > 0 ? nameValue : null;
};

export const formatElementReference = (stepName: string, referenceName: string) =>
  `${stepName}.${referenceName}`;

export const findElementByReferenceName = (
  elements: Array<Pick<StepElementDraft, "properties"> & { id: string }>,
  referenceName: string,
) =>
  elements.find((element) => getElementReferenceName(element) === referenceName) ?? null;
