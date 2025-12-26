import { Models } from "@db/models";

import { seedStep1 } from "./step1.seed";

export async function seedSteps(models: Models) {
  await seedStep1(models);
}
