import {
  createFlowInput,
  createFlowOutput,
} from "@packages/shared/http/schemas/flows/createFlow";
import checkExists from "@packages/shared/utils/checkExists";

import FlowEntity from "~entities/FlowEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import { canUserCreateFlowInOrganization } from "~src/utils/permissions/organizationPermissions";

const createFlow = enforceSchema({
  handler: async (req, res) => {
    const { name, organizationId, slug } = req.body;

    if (organizationId) {
      const userId = (
        await checkExists(req.context.sessionEntity).fetchUserEntity()
      ).dbModel.id;

      const createFlowError = await canUserCreateFlowInOrganization({
        userId,
        organizationId,
      });

      if (createFlowError instanceof Error) {
        throw createFlowError;
      }
    }

    // Question: do flows require an organizationId? can a user directly own a flow?
    const flowEntity = await FlowEntity.create({
      name,
      organizationId,
      slug,
    });

    res.status(201).json({
      id: flowEntity.dbModel.id,
      name: flowEntity.dbModel.name,
      organizationId: flowEntity.dbModel.organizationId,
      slug: flowEntity.dbModel.slug,
    });
  },
  inputSchema: createFlowInput,
  outputSchema: createFlowOutput,
});

export default handleRouteError(createFlow);
