import type { OrganizationAdminDetailType } from "@packages/shared/http/schemas/organizations/common";

import type OrganizationEntity from "../OrganizationEntity";

export default function getAdminDetail(
  this: OrganizationEntity,
): OrganizationAdminDetailType {
  return {
    id: this.dbModel.id,
    name: this.dbModel.name,
    slug: this.dbModel.slug,
  };
}
