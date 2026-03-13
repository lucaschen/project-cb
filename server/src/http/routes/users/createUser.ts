import {
  createUserInput,
  createUserOutput,
} from "@packages/shared/http/schemas/users/createUser";
import { UniqueConstraintError } from "sequelize";

import UserEntity from "~src/entities/UserEntity/UserEntity";
import enforceSchema from "~src/http/utils/enforceSchema";
import handleRouteError from "~src/http/utils/handleRouteError";
import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

const createUser = enforceSchema({
  handler: async (req, res) => {
    const { password, email } = req.body;

    let userEntity;
    try {
      userEntity = await UserEntity.create({ password, email });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new InvalidRequestError("User already exists.");
      }

      throw error;
    }

    const response = {
      email: userEntity.dbModel.email,
    };

    res.status(201).json(response).end();
  },
  inputSchema: createUserInput,
  outputSchema: createUserOutput,
});

export default handleRouteError(createUser);
