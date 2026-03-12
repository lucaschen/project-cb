import type { CreateOrganizationOutput } from "@packages/shared/http/schemas/organizations/createOrganization";
import {
  createOrganizationInput,
  createOrganizationOutput,
} from "@packages/shared/http/schemas/organizations/createOrganization";
import type { FindOrganizationsForCurrentUserOutput } from "@packages/shared/http/schemas/organizations/findOrganizationsForCurrentUser";
import { findOrganizationsForCurrentUserOutput } from "@packages/shared/http/schemas/organizations/findOrganizationsForCurrentUser";
import { z } from "zod";

import { apiRequest } from "../client";
import { enforceStrictSchema } from "../enforceSchema";

export const getCurrentUserOrganizations = enforceStrictSchema({
  handler: () =>
    apiRequest({
      method: "GET",
      path: "/users/current/organizations",
    }),
  inputSchema: z.any(),
  outputSchema: findOrganizationsForCurrentUserOutput,
}) as () => Promise<FindOrganizationsForCurrentUserOutput>;

export const createOrganization = enforceStrictSchema({
  handler: (input) =>
    apiRequest({
      body: input,
      method: "POST",
      path: "/organizations",
    }),
  inputSchema: createOrganizationInput,
  outputSchema: createOrganizationOutput,
}) as (input: {
  name: string;
  slug: string;
}) => Promise<CreateOrganizationOutput>;
