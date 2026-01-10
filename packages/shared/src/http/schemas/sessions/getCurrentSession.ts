import type { z } from "zod";

import { sessionPayload } from "./common";

export const getCurrentSessionOutput = sessionPayload;

export type GetCurrentSessionOutput = z.infer<typeof getCurrentSessionOutput>;
