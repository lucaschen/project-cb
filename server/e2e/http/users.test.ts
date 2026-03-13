import { createUserOutput } from "@packages/shared/http/schemas/users/createUser";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import UserEntity from "~src/entities/UserEntity/UserEntity";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedUser } from "../utils/users";

describe("user routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("POST /users", () => {
    it("creates a user and persists a hashed password", async () => {
      const email = "new-user@example.com";
      const password = "Password123!";

      const response = await request(createTestApp()).post("/users").send({
        email,
        password,
      });

      expect(response.status).toBe(201);
      expect(createUserOutput.parse(response.body)).toEqual({ email });

      const userEntity = await UserEntity.findByEmail(email);

      expect(userEntity).not.toBeNull();
      expect(userEntity?.dbModel.passwordHash).not.toBe(password);
      expect(await userEntity?.validatePassword(password)).toBe(true);
    });

    it("rejects malformed payloads", async () => {
      const response = await request(createTestApp()).post("/users").send({
        email: "broken@example.com",
      });

      expect(response.status).toBe(400);
    });

    it("rejects duplicate emails with a client error", async () => {
      const { email, password } = await seedUser();

      const response = await request(createTestApp()).post("/users").send({
        email,
        password,
      });

      expect(response.status).toBe(400);
    });
  });
});
