import { createSessionOutput } from "@packages/shared/http/schemas/sessions/createSession";
import { getCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { sessionCookieName } from "~src/config/session";

import { createTestAgent, createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedUser } from "../utils/users";

describe("session routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("creates a session cookie for valid credentials", async () => {
    const { email, password, userEntity } = await seedUser();

    const response = await request(createTestApp()).post("/sessions").send({
      email,
      password,
    });

    expect(response.status).toBe(201);
    expect(createSessionOutput.parse(response.body)).toEqual({
      email,
      userId: userEntity.dbModel.id,
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${sessionCookieName}=`),
      ]),
    );
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("HttpOnly")]),
    );
  });

  it("rejects an unknown email without setting a cookie", async () => {
    const response = await request(createTestApp()).post("/sessions").send({
      email: "missing@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(401);
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects an invalid password without setting a cookie", async () => {
    const { email } = await seedUser();

    const response = await request(createTestApp()).post("/sessions").send({
      email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects malformed login payloads", async () => {
    const response = await request(createTestApp())
      .post("/sessions")
      .send({ email: "user@example.com" });

    expect(response.status).toBe(400);
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("returns the current session for a valid session cookie", async () => {
    const { email, password, userEntity } = await seedUser();
    const agent = createTestAgent();

    const loginResponse = await agent
      .post("/sessions")
      .send({ email, password });
    expect(loginResponse.status).toBe(201);

    const currentSessionResponse = await agent.get("/sessions/current");

    expect(currentSessionResponse.status).toBe(200);
    expect(getCurrentSessionOutput.parse(currentSessionResponse.body)).toEqual({
      email,
      userId: userEntity.dbModel.id,
    });
  });

  it("rejects current-session requests without a cookie", async () => {
    const response = await request(createTestApp()).get("/sessions/current");

    expect(response.status).toBe(401);
  });

  it("clears the session cookie on logout and rejects subsequent current-session requests", async () => {
    const { email, password } = await seedUser();
    const agent = createTestAgent();

    const loginResponse = await agent
      .post("/sessions")
      .send({ email, password });
    expect(loginResponse.status).toBe(201);

    const logoutResponse = await agent.delete("/sessions/current");

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.text).toBe("");
    expect(logoutResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${sessionCookieName}=;`),
      ]),
    );

    const currentSessionResponse = await agent.get("/sessions/current");

    expect(currentSessionResponse.status).toBe(401);
  });

  it("returns the current unauthenticated logout failure on repeat logout", async () => {
    const { email, password } = await seedUser();
    const agent = createTestAgent();

    const loginResponse = await agent
      .post("/sessions")
      .send({ email, password });
    expect(loginResponse.status).toBe(201);

    const firstLogoutResponse = await agent.delete("/sessions/current");
    expect(firstLogoutResponse.status).toBe(200);

    const secondLogoutResponse = await agent.delete("/sessions/current");

    expect(secondLogoutResponse.status).toBe(401);
  });

  it("returns the current unauthenticated logout failure without a session", async () => {
    const response = await request(createTestApp()).delete("/sessions/current");

    expect(response.status).toBe(401);
  });
});
