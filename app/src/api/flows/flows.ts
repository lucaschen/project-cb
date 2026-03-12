import { flowPayload } from "@packages/shared/http/schemas/flows/common";
import type { CreateFlowOutput } from "@packages/shared/http/schemas/flows/createFlow";
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

type FindFlowsOutput = z.infer<typeof findFlowsOutput>;

export const getOrganizationFlows = enforceStrictSchema({
  handler: ({ organizationId }) =>
    apiRequest({
      method: "GET",
      path: `/organizations/${organizationId}/flows`,
    }),
  inputSchema: findFlowsParams,
  outputSchema: findFlowsOutput,
}) as (input: { organizationId: string }) => Promise<FindFlowsOutput>;

export const createFlow = enforceStrictSchema({
  handler: (input) =>
    apiRequest({
      body: input,
      method: "POST",
      path: "/flows",
    }),
  inputSchema: createFlowInput,
  outputSchema: createFlowOutput,
}) as (input: {
  name: string;
  organizationId: string;
  slug: string;
}) => Promise<CreateFlowOutput>;
