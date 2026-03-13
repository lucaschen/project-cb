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
  updateFlowMetadataInput,
  updateFlowMetadataOutput,
  updateFlowMetadataParams,
} from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import { z } from "zod";

import { apiRequest } from "../client";
import { enforceStrictSchema } from "../enforceSchema";

const findFlowsParams = z.object({
  organizationId: z.string().min(1),
});

const findFlowsOutput = z.array(flowSchema);

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
