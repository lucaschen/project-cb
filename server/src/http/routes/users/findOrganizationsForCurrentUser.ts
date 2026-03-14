import { findOrganizationsForCurrentUserOutput } from "@packages/shared/http/schemas/organizations/findOrganizationsForCurrentUser";
import checkExists from "@packages/shared/utils/checkExists";

import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";

const createOrganization = enforceSchema({
  handler: async (req, res) => {
    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();

    const organizationEntities = await userEntity.findOrganizations();
    const payload = organizationEntities.map((organizationEntity) =>
      organizationEntity.getSummary(),
    );

    res.status(200).json(payload);
  },
  outputSchema: findOrganizationsForCurrentUserOutput,
});

export default handleRouteError(createOrganization);
