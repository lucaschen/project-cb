import {
  createUserInput,
  createUserOutput,
} from "@packages/shared/http/schemas/users/createUser";

import UserEntity from "~src/entities/UserEntity/UserEntity";
import enforceSchema from "~src/http/utils/enforceSchema";

const createUser = enforceSchema({
  handler: async (req, res) => {
    const { password, email } = req.body;

    const userEntity = await UserEntity.create({ password, email });

    const response = {
      email: userEntity.dbModel.email,
    };

    res.status(201).json(response).end();
  },
  inputSchema: createUserInput,
  outputSchema: createUserOutput,
});

export default createUser;
