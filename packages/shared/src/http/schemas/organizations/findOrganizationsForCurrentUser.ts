import { z } from "zod";

import { organizationSummarySchema } from "./common";

export const findOrganizationsForCurrentUserOutput =
  z.array(organizationSummarySchema);

export type FindOrganizationsForCurrentUserOutput = z.infer<
  typeof findOrganizationsForCurrentUserOutput
>;
