import { createFlowOutput } from "@packages/shared/http/schemas/flows/createFlow";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import FlowEntity from "~entities/FlowEntity/FlowEntity";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedOrganizationForUser } from "../utils/organizations";
import { createAuthenticatedUser } from "../utils/users";

describe("flow creation routes", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("creates a flow for an admin organization member", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      permissions: OrganizationUserPermission.ADMIN,
      slug: "admin-org",
      userId: userEntity.dbModel.id,
    });

    const response = await agent.post("/flows").send({
      description: "Flow description",
      name: "Admin flow",
      organizationId: organization.dbModel.id,
      slug: "admin-flow",
    });

    expect(response.status).toBe(201);
    const payload = createFlowOutput.parse(response.body);
    expect(payload).toMatchObject({
      description: "Flow description",
      name: "Admin flow",
      organizationId: organization.dbModel.id,
      slug: "admin-flow",
    });

    const flowEntity = await FlowEntity.findById(payload.id);
    expect(flowEntity?.dbModel.description).toBe("Flow description");
  });

  it("creates a flow for an editor organization member and persists null description when omitted", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      permissions: OrganizationUserPermission.EDITOR,
      slug: "editor-org",
      userId: userEntity.dbModel.id,
    });

    const response = await agent.post("/flows").send({
      name: "Editor flow",
      organizationId: organization.dbModel.id,
      slug: "editor-flow",
    });

    expect(response.status).toBe(201);
    const payload = createFlowOutput.parse(response.body);
    expect(payload.description).toBeNull();

    const flowEntity = await FlowEntity.findById(payload.id);
    expect(flowEntity?.dbModel.description).toBeNull();
  });

  it("rejects unauthenticated requests", async () => {
    const { userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      slug: "unauth-org",
      userId: userEntity.dbModel.id,
    });

    const response = await request(createTestApp()).post("/flows").send({
      name: "Unauth flow",
      organizationId: organization.dbModel.id,
      slug: "unauth-flow",
    });

    expect(response.status).toBe(401);
  });

  it("rejects malformed payloads", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      slug: "broken-org",
      userId: userEntity.dbModel.id,
    });

    const response = await agent.post("/flows").send({
      name: "Broken flow",
      organizationId: organization.dbModel.id,
    });

    expect(response.status).toBe(400);
  });

  it("returns not found for an unknown organization", async () => {
    const { agent } = await createAuthenticatedUser();

    const response = await agent.post("/flows").send({
      name: "Missing org flow",
      organizationId: "missing-org-id",
      slug: "missing-org-flow",
    });

    expect(response.status).toBe(404);
  });

  it("rejects viewers from creating flows", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      permissions: OrganizationUserPermission.VIEWER,
      slug: "viewer-org",
      userId: userEntity.dbModel.id,
    });

    const response = await agent.post("/flows").send({
      name: "Viewer flow",
      organizationId: organization.dbModel.id,
      slug: "viewer-flow",
    });

    expect(response.status).toBe(401);
  });

  it("rejects duplicate slugs within the same organization with a client error", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const organization = await seedOrganizationForUser({
      slug: "duplicate-org",
      userId: userEntity.dbModel.id,
    });

    const firstResponse = await agent.post("/flows").send({
      name: "First flow",
      organizationId: organization.dbModel.id,
      slug: "duplicate-flow",
    });
    expect(firstResponse.status).toBe(201);

    const secondResponse = await agent.post("/flows").send({
      name: "Second flow",
      organizationId: organization.dbModel.id,
      slug: "duplicate-flow",
    });

    expect(secondResponse.status).toBe(400);
  });

  it("allows the same slug in different organizations", async () => {
    const { agent, userEntity } = await createAuthenticatedUser();
    const firstOrganization = await seedOrganizationForUser({
      slug: "first-org",
      userId: userEntity.dbModel.id,
    });
    const secondOrganization = await seedOrganizationForUser({
      slug: "second-org",
      userId: userEntity.dbModel.id,
    });

    const firstResponse = await agent.post("/flows").send({
      name: "First org flow",
      organizationId: firstOrganization.dbModel.id,
      slug: "shared-slug",
    });
    const secondResponse = await agent.post("/flows").send({
      name: "Second org flow",
      organizationId: secondOrganization.dbModel.id,
      slug: "shared-slug",
    });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
  });
});
