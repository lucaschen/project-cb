import {
  updateBuilderInput,
  updateBuilderOutput,
  updateBuilderParams,
} from "@packages/shared/http/schemas/flows/builder/updateBuilder";
import { flowSchema } from "@packages/shared/http/schemas/flows/common";
import {
  createFlowInput,
  createFlowOutput,
} from "@packages/shared/http/schemas/flows/createFlow";
import {
  fetchFlowOutput,
  fetchFlowParams,
} from "@packages/shared/http/schemas/flows/fetchFlow";
import {
  findStepElementsOutput,
  findStepElementsParams,
} from "@packages/shared/http/schemas/flows/steps/elements/findStepElements";
import {
  updateStepElementsInput,
  updateStepElementsOutput,
  updateStepElementsParams,
} from "@packages/shared/http/schemas/flows/steps/elements/updateStepElements";
import {
  updateFlowMetadataInput,
  updateFlowMetadataOutput,
  updateFlowMetadataParams,
} from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import {
  findOrganizationElementDefinitionsOutput,
  findOrganizationElementDefinitionsParams,
  type OrganizationElementDefinitionPropertyType,
  type OrganizationElementDefinitionType,
} from "@packages/shared/http/schemas/organizations/findOrganizationElementDefinitions";
import { z } from "zod";

import { apiRequest } from "../client";
import { enforceStrictSchema } from "../enforceSchema";

const findFlowsParams = z.object({
  organizationId: z.string().min(1),
});

const findFlowsOutput = z.array(flowSchema);

export type StepElementDefinitionType = OrganizationElementDefinitionType;
export type StepElementDefinitionPropertyType =
  OrganizationElementDefinitionPropertyType;

export const getOrganizationFlows = enforceStrictSchema({
  handler: ({ organizationId }) =>
    apiRequest({
      method: "GET",
      path: `/organizations/${organizationId}/flows`,
    }),
  inputSchema: findFlowsParams,
  outputSchema: findFlowsOutput,
});

export const createFlow = enforceStrictSchema({
  handler: (input) =>
    apiRequest({
      body: input,
      method: "POST",
      path: "/flows",
    }),
  inputSchema: createFlowInput,
  outputSchema: createFlowOutput,
});

export const getFlow = enforceStrictSchema({
  handler: ({ flowId }) =>
    apiRequest({
      method: "GET",
      path: `/flows/${flowId}`,
    }),
  inputSchema: fetchFlowParams,
  outputSchema: fetchFlowOutput,
});

export const updateFlowBuilder = enforceStrictSchema({
  handler: ({ flowId, input }) =>
    apiRequest({
      body: input,
      method: "PUT",
      path: `/flows/${flowId}/builder`,
    }),
  inputSchema: z.object({
    flowId: updateBuilderParams.shape.flowId,
    input: updateBuilderInput,
  }),
  outputSchema: updateBuilderOutput,
});

export const fetchStepElements = enforceStrictSchema({
  handler: ({ flowId, stepId }) =>
    apiRequest({
      method: "GET",
      path: `/flows/${flowId}/steps/${stepId}/elements`,
    }),
  inputSchema: findStepElementsParams,
  outputSchema: findStepElementsOutput,
});

export const fetchStepElementDefinitions = enforceStrictSchema({
  handler: ({ organizationId }) =>
    apiRequest({
      method: "GET",
      path: `/organizations/${organizationId}/element-definitions`,
    }),
  inputSchema: findOrganizationElementDefinitionsParams,
  outputSchema: findOrganizationElementDefinitionsOutput,
});

export const updateStepElements = enforceStrictSchema({
  handler: ({ flowId, input, stepId }) =>
    apiRequest({
      body: input,
      method: "PUT",
      path: `/flows/${flowId}/steps/${stepId}/elements`,
    }),
  inputSchema: z.object({
    flowId: updateStepElementsParams.shape.flowId,
    input: updateStepElementsInput,
    stepId: updateStepElementsParams.shape.stepId,
  }),
  outputSchema: updateStepElementsOutput,
});

export const updateFlowMetadata = enforceStrictSchema({
  handler: ({ flowId, input }) =>
    apiRequest({
      body: input,
      method: "PATCH",
      path: `/flows/${flowId}`,
    }),
  inputSchema: z.object({
    flowId: updateFlowMetadataParams.shape.flowId,
    input: updateFlowMetadataInput,
  }),
  outputSchema: updateFlowMetadataOutput,
});
