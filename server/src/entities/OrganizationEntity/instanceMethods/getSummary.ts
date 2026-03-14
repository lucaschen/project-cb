import type { OrganizationSummaryType } from "@packages/shared/http/schemas/organizations/common";

import type OrganizationEntity from "../OrganizationEntity";

export default function getSummary(
  this: OrganizationEntity,
): OrganizationSummaryType {
  return {
    id: this.dbModel.id,
    name: this.dbModel.name,
    slug: this.dbModel.slug,
  };
}
