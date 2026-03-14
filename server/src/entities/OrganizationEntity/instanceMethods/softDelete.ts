import { Flow } from "~db/models/Flow";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function softDelete(this: OrganizationEntity): Promise<void> {
  const flowCount = await Flow.count({
    where: {
      organizationId: this.dbModel.id,
    },
  });

  if (flowCount > 0) {
    throw new InvalidRequestError(
      "Organization cannot be deleted while flows still exist.",
    );
  }

  this.dbModel.deletedAt = new Date();
  await this.dbModel.save();
}
