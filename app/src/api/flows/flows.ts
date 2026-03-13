import { flowPayload } from "@packages/shared/http/schemas/flows/common";
import {
  createFlowInput,
  createFlowOutput,
} from "@packages/shared/http/schemas/flows/createFlow";
import { z } from "zod";

import { apiRequest } from "../client";
import { enforceStrictSchema } from "../enforceSchema";

const findFlowsParams = z.object({
  organizationId: z.string().min(1),
});

const findFlowsOutput = z.array(flowPayload);

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
