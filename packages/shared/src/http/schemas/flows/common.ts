import { z } from "zod";

import { conditionStatementSchema } from "~shared/db/schemas/conditionStatement";
import { ElementPropertyTypes, NodeType } from "~shared/types/enums";

export const flowPayload = z.object({
  description: z.string().nullable(),
  id: z.string().min(1),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  slug: z.string().min(1),
});

export type FlowPayload = z.infer<typeof flowPayload>;

export const nodeCoordinatesSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .nullable();

export type NodeCoordinatesSchema = z.infer<typeof nodeCoordinatesSchema>;

export const flowStepElementPropertyValueSchema = z.object({
  defaultValue: z.string(),
  propertyId: z.string().min(1),
  propertyName: z.string().min(1),
  propertyType: z.enum(ElementPropertyTypes),
  required: z.boolean(),
  value: z.string(),
});

export type FlowStepElementPropertyValueSchema = z.infer<
  typeof flowStepElementPropertyValueSchema
>;

export const flowStepElementSchema = z.object({
  elementId: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number(),
  properties: z.array(flowStepElementPropertyValueSchema),
});

export type FlowStepElementSchema = z.infer<typeof flowStepElementSchema>;

export const flowDecisionConditionSchema = z.object({
  id: z.string().min(1),
  order: z.number(),
  statement: conditionStatementSchema,
  toNodeId: z.string().min(1),
});

export type FlowDecisionConditionSchema = z.infer<
  typeof flowDecisionConditionSchema
>;

export const flowStepNodeSchema = z.object({
  coordinates: nodeCoordinatesSchema,
  elements: z.array(flowStepElementSchema),
  name: z.string().min(1),
  nextNodeId: z.string().nullable(),
  nodeId: z.string().min(1),
  type: z.literal(NodeType.STEP),
});

export type FlowStepNodeSchema = z.infer<typeof flowStepNodeSchema>;

export const flowDecisionNodeSchema = z.object({
  conditions: z.array(flowDecisionConditionSchema),
  coordinates: nodeCoordinatesSchema,
  fallbackNextNodeId: z.string().min(1),
  name: z.string().min(1),
  nodeId: z.string().min(1),
  type: z.literal(NodeType.DECISION),
});

export type FlowDecisionNodeSchema = z.infer<typeof flowDecisionNodeSchema>;

export const flowNodeSchema = z.discriminatedUnion("type", [
  flowStepNodeSchema,
  flowDecisionNodeSchema,
]);

export type FlowNodeSchema = z.infer<typeof flowNodeSchema>;

export const flowWithNodesSchema = flowPayload.extend({
  nodes: z.array(flowNodeSchema),
});

export type FlowWithNodesSchema = z.infer<typeof flowWithNodesSchema>;

export const flowBuilderSchema = z.object({
  flow: flowWithNodesSchema,
});

export type FlowBuilderSchema = z.infer<typeof flowBuilderSchema>;
