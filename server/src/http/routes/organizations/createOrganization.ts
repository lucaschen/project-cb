import {
  createOrganizationInput,
  createOrganizationOutput,
} from "@packages/shared/http/schemas/organizations/createOrganization";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import checkExists from "@packages/shared/utils/checkExists";

import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";

const createOrganization = enforceSchema({
  handler: async (req, res) => {
    const { name, slug } = req.body;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();

    const organizationEntity = await OrganizationEntity.create({
      name,
      slug,
    });

    await organizationEntity.addUser({
      userId: userEntity.dbModel.id,
      permissions: OrganizationUserPermission.ADMIN,
    });

    res.status(201).json({
      apiKey: organizationEntity.dbModel.apiKey,
      id: organizationEntity.dbModel.id,
      name: organizationEntity.dbModel.name,
      slug: organizationEntity.dbModel.slug,
    });
  },
  inputSchema: createOrganizationInput,
  outputSchema: createOrganizationOutput,
});

export default handleRouteError(createOrganization);
