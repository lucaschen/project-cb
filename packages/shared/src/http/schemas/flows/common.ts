import { z } from "zod";

import { conditionStatementSchema } from "~shared/db/schemas/conditionStatement";
import { ElementPropertyTypes, NodeType } from "~shared/types/enums";

export const flowSchema = z.object({
  description: z.string().nullable(),
  id: z.string().min(1),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  slug: z.string().min(1),
});

export type FlowType = z.infer<typeof flowSchema>;

export const nodeCoordinatesSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .nullable();

export type NodeCoordinatesType = z.infer<typeof nodeCoordinatesSchema>;

export const flowStepElementPropertyValueSchema = z.object({
  defaultValue: z.string(),
  propertyId: z.string().min(1),
  propertyName: z.string().min(1),
  propertyType: z.enum(ElementPropertyTypes),
  required: z.boolean(),
  value: z.string(),
});

export type FlowStepElementPropertyValueType = z.infer<
  typeof flowStepElementPropertyValueSchema
>;

export const flowStepElementSchema = z.object({
  elementId: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number(),
  properties: z.array(flowStepElementPropertyValueSchema),
});

export type FlowStepElementType = z.infer<typeof flowStepElementSchema>;

export const flowDecisionConditionSchema = z.object({
  id: z.string().min(1),
  order: z.number(),
  statement: conditionStatementSchema,
  toNodeId: z.string().min(1),
});

export type FlowDecisionConditionType = z.infer<
  typeof flowDecisionConditionSchema
>;

export const flowStepNodeSchema = z.object({
  coordinates: nodeCoordinatesSchema,
  elements: z.array(flowStepElementSchema),
  name: z.string().min(1),
  nextNodeId: z.string().nullable(),
  nodeId: z.string().min(1),
  order: z.number().int().nonnegative(),
  type: z.literal(NodeType.STEP),
});

export type FlowStepNodeType = z.infer<typeof flowStepNodeSchema>;

export const flowDecisionNodeSchema = z.object({
  conditions: z.array(flowDecisionConditionSchema),
  coordinates: nodeCoordinatesSchema,
  fallbackNextNodeId: z.string().min(1),
  name: z.string().min(1),
  nodeId: z.string().min(1),
  type: z.literal(NodeType.DECISION),
});

export type FlowDecisionNodeType = z.infer<typeof flowDecisionNodeSchema>;

export const flowNodeSchema = z.discriminatedUnion("type", [
  flowStepNodeSchema,
  flowDecisionNodeSchema,
]);

export type FlowNodeType = z.infer<typeof flowNodeSchema>;

export const flowWithNodesSchema = flowSchema.extend({
  nodes: z.array(flowNodeSchema),
});

export type FlowWithNodesType = z.infer<typeof flowWithNodesSchema>;

export const flowBuilderSchema = z.object({
  flow: flowWithNodesSchema,
});

export type FlowBuilderType = z.infer<typeof flowBuilderSchema>;
