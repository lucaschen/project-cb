import { randomUUID } from "crypto";

import UserEntity from "~src/entities/UserEntity/UserEntity";

import { createTestAgent } from "./app";

export const seedUser = async ({
  email = `user-${randomUUID()}@example.com`,
  password = "Password123!",
}: {
  email?: string;
  password?: string;
} = {}) => {
  const userEntity = await UserEntity.create({ email, password });

  return { email, password, userEntity };
};

export const createAuthenticatedUser = async ({
  email,
  password,
}: {
  email?: string;
  password?: string;
} = {}) => {
  const seededUser = await seedUser({ email, password });
  const agent = createTestAgent();

  const loginResponse = await agent.post("/sessions").send({
    email: seededUser.email,
    password: seededUser.password,
  });

  return {
    ...seededUser,
    agent,
    loginResponse,
  };
};
