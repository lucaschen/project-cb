import { findFlowsOutput } from "@packages/shared/http/schemas/flows/findFlows";
import { createOrganizationOutput } from "@packages/shared/http/schemas/organizations/createOrganization";
import { createOrganizationApiKeyOutput } from "@packages/shared/http/schemas/organizations/createOrganizationApiKey";
import { createOrganizationInviteOutput } from "@packages/shared/http/schemas/organizations/createOrganizationInvite";
import { fetchOrganizationOutput } from "@packages/shared/http/schemas/organizations/fetchOrganization";
import { findOrganizationApiKeysOutput } from "@packages/shared/http/schemas/organizations/findOrganizationApiKeys";
import { findOrganizationElementDefinitionsOutput } from "@packages/shared/http/schemas/organizations/findOrganizationElementDefinitions";
import { findOrganizationInvitesOutput } from "@packages/shared/http/schemas/organizations/findOrganizationInvites";
import { findOrganizationMembersOutput } from "@packages/shared/http/schemas/organizations/findOrganizationMembers";
import { findOrganizationsForCurrentUserOutput } from "@packages/shared/http/schemas/organizations/findOrganizationsForCurrentUser";
import { updateOrganizationOutput } from "@packages/shared/http/schemas/organizations/updateOrganization";
import { updateOrganizationMemberOutput } from "@packages/shared/http/schemas/organizations/updateOrganizationMember";
import { OrganizationUserPermission } from "@packages/shared/types/enums";
import { randomUUID } from "crypto";
import { QueryTypes } from "sequelize";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  backfillLegacyOrganizationApiKeys,
  captureLegacyOrganizationApiKeys,
} from "~db/backfillLegacyOrganizationApiKeys";
import { OrganizationApiKey } from "~db/models/OrganizationApiKey";
import { OrganizationUserInvitation } from "~db/models/OrganizationUserInvitation";
import { seedElementProperties } from "~db/seeds/elementProperties.seed";
import { seedElements } from "~db/seeds/elements.seed";
import { sequelize } from "~db/sequelize";
import { models } from "~src/db/setup";

import { createTestApp } from "../utils/app";
import {
  resetTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "../utils/db";
import { seedFlow } from "../utils/flows";
import {
  addUserToOrganization,
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
      expect(
        findOrganizationsForCurrentUserOutput.parse(response.body),
      ).toEqual([]);
    });

    it("returns only the authenticated user's organizations", async () => {
      const { agent, userEntity, loginResponse } =
        await createAuthenticatedUser();
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
      expect(
        findOrganizationsForCurrentUserOutput.parse(response.body),
      ).toEqual([
        {
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

  describe("GET /organizations/:organizationId", () => {
    it("returns admin detail for organization admins", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "admin-detail-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}`,
      );

      expect(response.status).toBe(200);
      expect(fetchOrganizationOutput.parse(response.body)).toEqual({
        id: organization.dbModel.id,
        name: organization.dbModel.name,
        slug: organization.dbModel.slug,
      });
    });

    it("rejects non-admin organization members", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "viewer-detail-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /organizations/:organizationId/members", () => {
    it("allows any organization member to view members", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const otherUser = await seedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "members-org",
        userId: userEntity.dbModel.id,
      });
      await addUserToOrganization({
        organizationEntity: organization,
        permissions: OrganizationUserPermission.EDITOR,
        userId: otherUser.userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/members`,
      );
      const members = findOrganizationMembersOutput.parse(response.body);
      const expectedMembers = [
        {
          email: userEntity.dbModel.email,
          permissions: OrganizationUserPermission.VIEWER,
          userId: userEntity.dbModel.id,
        },
        {
          email: otherUser.userEntity.dbModel.email,
          permissions: OrganizationUserPermission.EDITOR,
          userId: otherUser.userEntity.dbModel.id,
        },
      ].sort((left, right) => left.userId.localeCompare(right.userId));

      expect(response.status).toBe(200);
      expect(members).toEqual(expectedMembers);
    });
  });

  describe("organization member management routes", () => {
    it("allows admins to update another member's role", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const otherUser = await seedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "update-member-org",
        userId: userEntity.dbModel.id,
      });
      await addUserToOrganization({
        organizationEntity: organization,
        permissions: OrganizationUserPermission.VIEWER,
        userId: otherUser.userEntity.dbModel.id,
      });

      const response = await agent
        .patch(
          `/organizations/${organization.dbModel.id}/members/${otherUser.userEntity.dbModel.id}`,
        )
        .send({
          permissions: OrganizationUserPermission.EDITOR,
        });

      expect(response.status).toBe(200);
      expect(updateOrganizationMemberOutput.parse(response.body)).toEqual({
        email: otherUser.userEntity.dbModel.email,
        permissions: OrganizationUserPermission.EDITOR,
        userId: otherUser.userEntity.dbModel.id,
      });
    });

    it("rejects removing the last admin from an organization", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "last-admin-org",
        userId: userEntity.dbModel.id,
      });

      const updateResponse = await agent
        .patch(
          `/organizations/${organization.dbModel.id}/members/${userEntity.dbModel.id}`,
        )
        .send({
          permissions: OrganizationUserPermission.VIEWER,
        });

      const deleteResponse = await agent.delete(
        `/organizations/${organization.dbModel.id}/members/${userEntity.dbModel.id}`,
      );

      expect(updateResponse.status).toBe(400);
      expect(deleteResponse.status).toBe(400);
    });
  });

  describe("organization API key routes", () => {
    it("allows admins to create, list, and revoke organization API keys", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "api-keys-org",
        userId: userEntity.dbModel.id,
      });

      const createResponse = await agent
        .post(`/organizations/${organization.dbModel.id}/api-keys`)
        .send({
          name: "Primary key",
        });

      expect(createResponse.status).toBe(201);
      const createdApiKey = createOrganizationApiKeyOutput.parse(
        createResponse.body,
      );
      expect(createdApiKey.key.startsWith("org_")).toBe(true);
      expect(createdApiKey.createdByUserId).toBe(userEntity.dbModel.id);

      const listResponse = await agent.get(
        `/organizations/${organization.dbModel.id}/api-keys`,
      );

      expect(listResponse.status).toBe(200);
      expect(findOrganizationApiKeysOutput.parse(listResponse.body)).toEqual([
        {
          createdAt: createdApiKey.createdAt,
          createdByUserId: createdApiKey.createdByUserId,
          expiresAt: createdApiKey.expiresAt,
          id: createdApiKey.id,
          lastUsedAt: createdApiKey.lastUsedAt,
          name: createdApiKey.name,
          prefix: createdApiKey.prefix,
          revokedAt: createdApiKey.revokedAt,
          revokedByUserId: createdApiKey.revokedByUserId,
        },
      ]);

      const revokeResponse = await agent.delete(
        `/organizations/${organization.dbModel.id}/api-keys/${createdApiKey.id}`,
      );

      expect(revokeResponse.status).toBe(204);

      const afterRevokeResponse = await agent.get(
        `/organizations/${organization.dbModel.id}/api-keys`,
      );
      expect(afterRevokeResponse.status).toBe(200);
      expect(
        findOrganizationApiKeysOutput.parse(afterRevokeResponse.body),
      ).toEqual([]);
    });

    it("excludes expired organization API keys from active listings", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "expired-api-key-org",
        userId: userEntity.dbModel.id,
      });

      await OrganizationApiKey.create({
        createdByUserId: userEntity.dbModel.id,
        expiresAt: new Date(Date.now() - 60_000),
        id: randomUUID(),
        key: "org_expired_test_key",
        lastUsedAt: null,
        name: "Expired key",
        organizationId: organization.dbModel.id,
        prefix: "org_expired_",
        revokedAt: null,
        revokedByUserId: null,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/api-keys`,
      );

      expect(response.status).toBe(200);
      expect(findOrganizationApiKeysOutput.parse(response.body)).toEqual([]);
    });

    it("rejects API key reads for non-admin members", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "viewer-api-key-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/api-keys`,
      );

      expect(response.status).toBe(401);
    });

    it("backfills a legacy organization apiKey column into the new table", async () => {
      const { userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "legacy-api-key-org",
        userId: userEntity.dbModel.id,
      });
      const legacyApiKey = "org_legacy_key_for_backfill";

      await sequelize.query(
        'ALTER TABLE organizations ADD COLUMN "apiKey" VARCHAR',
        { type: QueryTypes.RAW },
      );
      await sequelize.query(
        'UPDATE organizations SET "apiKey" = :apiKey WHERE id = :organizationId',
        {
          replacements: {
            apiKey: legacyApiKey,
            organizationId: organization.dbModel.id,
          },
          type: QueryTypes.UPDATE,
        },
      );

      const capturedLegacyApiKeys =
        await captureLegacyOrganizationApiKeys(sequelize);
      await backfillLegacyOrganizationApiKeys(capturedLegacyApiKeys, models);

      const apiKeys = await OrganizationApiKey.findAll({
        where: {
          organizationId: organization.dbModel.id,
        },
      });

      expect(apiKeys).toHaveLength(1);
      expect(apiKeys[0]?.key).toBe(legacyApiKey);
      expect(apiKeys[0]?.createdByUserId).toBe(userEntity.dbModel.id);
    });
  });

  describe("organization invite routes", () => {
    it("allows admins to create and list normalized pending invites", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "invite-org",
        userId: userEntity.dbModel.id,
      });
      const expiresAt = new Date(Date.now() + 60_000).toISOString();

      const createResponse = await agent
        .post(`/organizations/${organization.dbModel.id}/invites`)
        .send({
          email: "invitee@example.com",
          expiresAt,
          permissions: OrganizationUserPermission.EDITOR,
        });

      expect(createResponse.status).toBe(201);
      const invite = createOrganizationInviteOutput.parse(createResponse.body);

      expect(invite.email).toBe("invitee@example.com");
      expect(invite.invitedByUserId).toBe(userEntity.dbModel.id);

      const listResponse = await agent.get(
        `/organizations/${organization.dbModel.id}/invites`,
      );

      expect(listResponse.status).toBe(200);
      expect(findOrganizationInvitesOutput.parse(listResponse.body)).toEqual([
        invite,
      ]);
    });

    it("rejects duplicate active invites but allows re-inviting after expiry", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "duplicate-invite-org",
        userId: userEntity.dbModel.id,
      });
      const email = "duplicate@example.com";

      await OrganizationUserInvitation.create({
        email,
        expiresAt: new Date(Date.now() - 60_000),
        id: randomUUID(),
        invitedByUserId: userEntity.dbModel.id,
        organizationId: organization.dbModel.id,
        permissions: OrganizationUserPermission.VIEWER,
      });

      const firstResponse = await agent
        .post(`/organizations/${organization.dbModel.id}/invites`)
        .send({
          email,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          permissions: OrganizationUserPermission.VIEWER,
        });

      expect(firstResponse.status).toBe(201);

      const duplicateResponse = await agent
        .post(`/organizations/${organization.dbModel.id}/invites`)
        .send({
          email,
          expiresAt: new Date(Date.now() + 120_000).toISOString(),
          permissions: OrganizationUserPermission.VIEWER,
        });

      expect(duplicateResponse.status).toBe(400);
    });

    it("rejects invite reads for non-admin members", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "viewer-invite-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/invites`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe("organization settings and deletion routes", () => {
    it("allows admins to update organization settings", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "settings-org",
        userId: userEntity.dbModel.id,
      });

      const response = await agent
        .patch(`/organizations/${organization.dbModel.id}`)
        .send({
          name: "Updated Org Name",
          slug: "updated-org-slug",
        });

      expect(response.status).toBe(200);
      expect(updateOrganizationOutput.parse(response.body)).toEqual({
        id: organization.dbModel.id,
        name: "Updated Org Name",
        slug: "updated-org-slug",
      });
    });

    it("excludes soft-deleted organizations from current-user organization listings", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "delete-empty-org",
        userId: userEntity.dbModel.id,
      });

      const deleteResponse = await agent.delete(
        `/organizations/${organization.dbModel.id}`,
      );
      expect(deleteResponse.status).toBe(204);

      const organizationsResponse = await agent.get(
        "/users/current/organizations",
      );
      expect(organizationsResponse.status).toBe(200);
      expect(
        findOrganizationsForCurrentUserOutput.parse(organizationsResponse.body),
      ).toEqual([]);
    });

    it("rejects deleting organizations that still have flows", async () => {
      const { agent, userEntity } = await createAuthenticatedUser();
      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.ADMIN,
        slug: "delete-flow-org",
        userId: userEntity.dbModel.id,
      });
      await seedFlow({
        name: "Protected flow",
        organizationId: organization.dbModel.id,
        slug: "protected-flow",
      });

      const response = await agent.delete(
        `/organizations/${organization.dbModel.id}`,
      );

      expect(response.status).toBe(400);
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

      const organizationsResponse = await agent.get(
        "/users/current/organizations",
      );

      expect(organizationsResponse.status).toBe(200);
      expect(
        findOrganizationsForCurrentUserOutput.parse(organizationsResponse.body),
      ).toEqual([
        {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
      ]);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(createTestApp())
        .post("/organizations")
        .send({
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
      const { agent, userEntity, loginResponse } =
        await createAuthenticatedUser();
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
      const { agent, userEntity, loginResponse } =
        await createAuthenticatedUser();
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

  describe("GET /organizations/:organizationId/element-definitions", () => {
    it("returns the built-in step element definitions for accessible organizations", async () => {
      const { agent, userEntity, loginResponse } =
        await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const organization = await seedOrganizationForUser({
        permissions: OrganizationUserPermission.VIEWER,
        slug: "element-definitions-org",
        userId: userEntity.dbModel.id,
      });
      await seedElements(models);
      await seedElementProperties(models);

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/element-definitions`,
      );
      const definitions = findOrganizationElementDefinitionsOutput.parse(
        response.body,
      );

      expect(response.status).toBe(200);
      expect(definitions.map((definition) => definition.elementId)).toEqual([
        "header",
        "subtitle",
        "label",
        "textInput",
        "textarea",
        "numberInput",
        "select",
        "button",
        "tooltip",
        "datePicker",
      ]);
      expect(
        definitions.map((definition) => ({
          elementId: definition.elementId,
          propertyIds: definition.properties.map((property) => property.propertyId),
        })),
      ).toEqual([
        { elementId: "header", propertyIds: ["headerText", "headerAlign"] },
        { elementId: "subtitle", propertyIds: ["subtitleText", "subtitleAlign"] },
        { elementId: "label", propertyIds: ["labelText", "labelFor"] },
        {
          elementId: "textInput",
          propertyIds: [
            "textInputPlaceholder",
            "textInputName",
            "textInputRequired",
          ],
        },
        { elementId: "textarea", propertyIds: ["textareaLabel"] },
        {
          elementId: "numberInput",
          propertyIds: [
            "numberInputLabel",
            "numberInputName",
            "numberInputRequired",
            "numberInputMin",
            "numberInputMax",
            "numberInputFormat",
          ],
        },
        {
          elementId: "select",
          propertyIds: [
            "selectName",
            "selectOptions",
            "selectRequired",
            "selectMultiple",
          ],
        },
        {
          elementId: "button",
          propertyIds: [
            "buttonText",
            "buttonVariant",
            "buttonDisableWhenIncomplete",
            "buttonOnClick",
          ],
        },
        {
          elementId: "tooltip",
          propertyIds: ["tooltipTriggerText", "tooltipHoverText"],
        },
        {
          elementId: "datePicker",
          propertyIds: [
            "datePickerName",
            "datePickerFormat",
            "datePickerRequired",
          ],
        },
      ]);
      expect(definitions[0]).toEqual({
        description: "Header of the form",
        elementId: "header",
        name: "Header",
        properties: [
          {
            defaultValue: "Header",
            propertyId: "headerText",
            propertyName: "text",
            propertyType: "STRING",
            required: true,
          },
          {
            defaultValue: "center",
            propertyId: "headerAlign",
            propertyName: "align",
            propertyType: "STRING",
            required: true,
          },
        ],
      });
    });

    it("rejects unauthenticated requests", async () => {
      const organization = await seedOrganization();

      const response = await request(createTestApp()).get(
        `/organizations/${organization.dbModel.id}/element-definitions`,
      );

      expect(response.status).toBe(401);
    });

    it("rejects authenticated users without access to the organization", async () => {
      const { agent, loginResponse } = await createAuthenticatedUser();
      expect(loginResponse.status).toBe(201);

      const organization = await seedOrganization();

      const response = await agent.get(
        `/organizations/${organization.dbModel.id}/element-definitions`,
      );

      expect(response.status).toBe(401);
    });
  });
});
