import {
  findOrganizationElementDefinitionsOutput,
  findOrganizationElementDefinitionsParams,
} from "@packages/shared/http/schemas/organizations/findOrganizationElementDefinitions";
import checkExists from "@packages/shared/utils/checkExists";

import ElementEntity from "~entities/ElementEntity";
import OrganizationEntity from "~entities/OrganizationEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidCredentialsError from "~src/utils/errors/InvalidCredentialsError";
import NotFoundError from "~src/utils/errors/NotFoundError";

const findOrganizationElementDefinitions = enforceSchema({
  handler: async (req, res) => {
    const { organizationId } = req.params;

    const userEntity = await checkExists(
      req.context.sessionEntity,
    ).fetchUserEntity();
    const organizationEntity =
      await OrganizationEntity.findById(organizationId);

    if (!organizationEntity) {
      throw new NotFoundError(`Organization id: ${organizationId} not found.`);
    }

    const canReadFlows =
      await userEntity.canReadFlowsInOrganization(organizationId);
    if (!canReadFlows) {
      throw new InvalidCredentialsError(
        "Insufficient permissions to view organization element definitions.",
      );
    }

    const elementEntities = await ElementEntity.findAll();

    const response = await Promise.all(
      elementEntities.map(async (elementEntity) => {
        const elementPropertyEntities = await elementEntity.fetchProperties();

        return {
          description: elementEntity.dbModel.description,
          elementId: elementEntity.dbModel.id,
          name: elementEntity.dbModel.name,
          properties: elementPropertyEntities.map((elementPropertyEntity) => {
            const {
              id,
              description,
              propertyName,
              propertyType,
              required,
              defaultValue,
            } = elementPropertyEntity.getPayload();

            return {
              propertyId: id,
              description,
              propertyName,
              propertyType,
              required,
              defaultValue,
            };
          }),
        };
      }),
    );

    res.status(200).json(response);
  },
  outputSchema: findOrganizationElementDefinitionsOutput,
  paramsSchema: findOrganizationElementDefinitionsParams,
});

export default handleRouteError(findOrganizationElementDefinitions);
