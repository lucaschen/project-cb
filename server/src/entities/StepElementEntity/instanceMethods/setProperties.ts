import { StepElementProperties } from "~db/models/StepElementProperties";
import { sequelize } from "~db/sequelize";

import type StepElementEntity from "../StepElementEntity";

export default async function setProperties(
  this: StepElementEntity,
  properties: Record<string, unknown>,
) {
  await sequelize.transaction(async (transaction) => {
    await Promise.all(
      Object.entries(properties).map(async ([propertyId, propertyValue]) => {
        return await StepElementProperties.upsert(
          {
            stepElementId: this.dbModel.id,
            propertyId,
            propertyValue: `${propertyValue}`,
          },
          { transaction },
        );
      }),
    );
  });

  this.dbModel.reload();

  return this;
}
