import { z } from "zod";

import { conditionStatementSchema } from "~shared/db/schemas/conditionStatement";
import { NodeType } from "~shared/types/enums";

import {
  hydratedStepElementPropertySchema,
  hydratedStepElementSchema,
} from "./steps/elements/common";

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

export const flowStepElementPropertyValueSchema =
  hydratedStepElementPropertySchema;

export type FlowStepElementPropertyValueType = z.infer<
  typeof flowStepElementPropertyValueSchema
>;

export const flowStepElementSchema = hydratedStepElementSchema;

export type FlowStepElementType = z.infer<typeof flowStepElementSchema>;

export const decisionConditionSchema = z.object({
  id: z.string().min(1),
  order: z.number(),
  statement: conditionStatementSchema,
  toNodeId: z.string().min(1),
});

export type DecisionConditionType = z.infer<typeof decisionConditionSchema>;

export const stepNodeSchema = z.object({
  coordinates: nodeCoordinatesSchema,
  elements: z.array(flowStepElementSchema),
  name: z.string().min(1),
  nextNodeId: z.string().nullable(),
  nodeId: z.string().min(1),
  type: z.literal(NodeType.STEP),
});

export type StepNodeType = z.infer<typeof stepNodeSchema>;

export const decisionNodeSchema = z.object({
  conditions: z.array(decisionConditionSchema),
  coordinates: nodeCoordinatesSchema,
  fallbackNextNodeId: z.string().min(1),
  name: z.string().min(1),
  nodeId: z.string().min(1),
  type: z.literal(NodeType.DECISION),
});

export type DecisionNodeType = z.infer<typeof decisionNodeSchema>;

export const nodeSchema = z.discriminatedUnion("type", [
  stepNodeSchema,
  decisionNodeSchema,
]);

export type NodePayloadType = z.infer<typeof nodeSchema>;

export const flowWithNodesSchema = flowSchema.extend({
  nodes: z.array(nodeSchema),
});

export type FlowWithNodesType = z.infer<typeof flowWithNodesSchema>;

export const flowBuilderSchema = z.object({
  flow: flowWithNodesSchema,
});

export type FlowBuilderType = z.infer<typeof flowBuilderSchema>;
