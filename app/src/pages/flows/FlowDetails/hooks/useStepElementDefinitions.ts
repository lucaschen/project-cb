import {
  fetchStepElementDefinitions,
  type StepElementDefinitionType,
} from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import type {
  HydratedStepElementPropertyType,
  HydratedStepElementType,
} from "@packages/shared/http/schemas/flows/steps/elements/common";
import { useQuery } from "@tanstack/react-query";

export type StepElementDefinition = StepElementDefinitionType;

export const createHydratedStepElementFromDefinition = (
  definition: StepElementDefinition,
  id = crypto.randomUUID(),
): HydratedStepElementType => ({
  elementId: definition.elementId,
  id,
  // Step element names are backend-facing identifiers, not user-facing labels.
  name: id,
  order: 0,
  properties: definition.properties.map(
    (property): HydratedStepElementPropertyType => ({
      defaultValue: property.defaultValue,
      propertyId: property.propertyId,
      propertyName: property.propertyName,
      propertyType: property.propertyType,
      required: property.required,
      value: property.defaultValue,
    }),
  ),
});

const useStepElementDefinitions = (organizationId: string | null) =>
  useQuery({
    enabled: Boolean(organizationId),
    queryFn: () =>
      fetchStepElementDefinitions({
        organizationId: organizationId!,
      }),
    queryKey: organizationId
      ? queryKeys.organizationElementDefinitions(organizationId)
      : ["organizations", "element-definitions"],
    staleTime: Infinity,
  });

export default useStepElementDefinitions;
