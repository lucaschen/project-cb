import { z } from "zod";

import { organizationPayload } from "./common";

export const findOrganizationsForCurrentUserOutput =
  z.array(organizationPayload);

export type FindOrganizationsForCurrentUserOutput = z.infer<
  typeof findOrganizationsForCurrentUserOutput
>;
