import { z } from "zod";

export const deleteCurrentSessionOutput = z.literal("");

export type DeleteCurrentSessionOutput = z.infer<typeof deleteCurrentSessionOutput>;
