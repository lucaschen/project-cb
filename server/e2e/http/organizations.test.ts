import { findFlowsOutput } from "@packages/shared/http/schemas/flows/findFlows";
import { createOrganizationOutput } from "@packages/shared/http/schemas/organizations/createOrganization";
import { findOrganizationsForCurrentUserOutput } from "@packages/shared/http/schemas/organizations/findOrganizationsForCurrentUser";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedFlow } from "../utils/flows";
import {
  seedOrganization,
  seedOrganizationForUser,
} from "../utils/organizations";
import { createAuthenticatedUser, seedUser } from "../utils/users";

describe("organization routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("GET /users/current/organizations", () => {
    it("returns an empty array for an authenticated user with no organizations", async () => {
      const { agent, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const response = await agent.get("/users/current/organizations");

      expect(response.status).toBe(200);
      expect(findOrganizationsForCurrentUserOutput.parse(response.body)).toEqual(
        [],
      );
    });

    it("returns only the authenticated user's organizations", async () => {
      const { agent, userEntity, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const ownOrganization = await seedOrganizationForUser({
        slug: "owned-org",
        userId: userEntity.dbModel.id,
      });
      await seedOrganizationForUser({
        slug: "other-org",
        userId: (await seedUser()).userEntity.dbModel.id,
      });

      const response = await agent.get("/users/current/organizations");

      expect(response.status).toBe(200);
      expect(findOrganizationsForCurrentUserOutput.parse(response.body)).toEqual([
        {
          apiKey: ownOrganization.dbModel.apiKey,
          id: ownOrganization.dbModel.id,
          name: ownOrganization.dbModel.name,
          slug: ownOrganization.dbModel.slug,
        },
      ]);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(createTestApp()).get(
        "/users/current/organizations",
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /organizations", () => {
    it("creates an organization and makes it immediately visible to the creator", async () => {
      const { agent, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const createResponse = await agent.post("/organizations").send({
        name: "Acme",
        slug: "acme",
      });

      expect(createResponse.status).toBe(201);
      const organization = createOrganizationOutput.parse(createResponse.body);

      const organizationsResponse = await agent.get("/users/current/organizations");

      expect(organizationsResponse.status).toBe(200);
      expect(
        findOrganizationsForCurrentUserOutput.parse(organizationsResponse.body),
      ).toEqual([organization]);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(createTestApp()).post("/organizations").send({
        name: "Acme",
        slug: "acme",
      });

      expect(response.status).toBe(401);
    });

    it("rejects malformed payloads", async () => {
      const { agent, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const response = await agent.post("/organizations").send({
        name: "Acme",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /organizations/:organizationId/flows", () => {
    it("returns an empty list for an accessible organization with no flows", async () => {
      const { agent, userEntity, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const organization = await seedOrganizationForUser({
        slug: "empty-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/flows`,
      );

      expect(response.status).toBe(200);
      expect(findFlowsOutput.parse(response.body)).toEqual([]);
    });

    it("returns only flows for the requested accessible organization", async () => {
      const { agent, userEntity, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "flows-org",
        userId: userEntity.dbModel.id,
      });
      const otherOrganization = await seedOrganization();

      const flowA = await seedFlow({
        name: "Alpha flow",
        organizationId: organization.dbModel.id,
        slug: "alpha-flow",
      });
      await seedFlow({
        name: "Hidden flow",
        organizationId: otherOrganization.dbModel.id,
        slug: "hidden-flow",
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/flows`,
      );

      expect(response.status).toBe(200);
      expect(findFlowsOutput.parse(response.body)).toEqual([
        flowA.getPayload(),
      ]);
    });

    it("rejects unauthenticated requests", async () => {
      const organization = await seedOrganization();

      const response = await request(createTestApp()).get(
        `/organizations/${organization.dbModel.id}/flows`,
      );

      expect(response.status).toBe(401);
    });

    it("rejects authenticated users without access to the organization", async () => {
      const { agent, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const organization = await seedOrganization();

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/flows`,
      );

      expect(response.status).toBe(401);
    });
  });
});
