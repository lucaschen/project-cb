import { ElementPropertyTypes } from "@packages/shared/types/enums";
import { z } from "zod";

import { organizationIdParamsSchema } from "./common";

const findOrganizationElementDefinitionsPropertyOutput = z
  .object({
    defaultValue: z.string(),
    description: z.string().optional(),
    propertyId: z.string().min(1),
    propertyName: z.string().min(1),
    propertyType: z.enum(ElementPropertyTypes),
    required: z.boolean(),
  })
  .strict();

export type OrganizationElementDefinitionPropertyType = z.infer<
  typeof findOrganizationElementDefinitionsPropertyOutput
>;

const findOrganizationElementDefinitionsItemOutput = z
  .object({
    description: z.string().min(1),
    elementId: z.string().min(1),
    name: z.string().min(1),
    properties: z.array(findOrganizationElementDefinitionsPropertyOutput),
  })
  .strict();

export type OrganizationElementDefinitionType = z.infer<
  typeof findOrganizationElementDefinitionsItemOutput
>;

export const findOrganizationElementDefinitionsParams =
  organizationIdParamsSchema;

export type FindOrganizationElementDefinitionsParams = z.infer<
  typeof findOrganizationElementDefinitionsParams
>;

export const findOrganizationElementDefinitionsOutput = z.array(
  findOrganizationElementDefinitionsItemOutput,
);

export type FindOrganizationElementDefinitionsOutput = z.infer<
  typeof findOrganizationElementDefinitionsOutput
>;
