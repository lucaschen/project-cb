import type { z } from "zod";

import {
  organizationAdminDetailSchema,
  organizationIdParamsSchema,
} from "./common";

export const fetchOrganizationParams = organizationIdParamsSchema;

export type FetchOrganizationParams = z.infer<typeof fetchOrganizationParams>;

export const fetchOrganizationOutput = organizationAdminDetailSchema;

export type FetchOrganizationOutput = z.infer<typeof fetchOrganizationOutput>;
