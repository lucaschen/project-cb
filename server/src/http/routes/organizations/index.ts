import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createOrganization from "./createOrganization";
import createOrganizationApiKey from "./createOrganizationApiKey";
import createOrganizationInvite from "./createOrganizationInvite";
import deleteOrganization from "./deleteOrganization";
import deleteOrganizationInvite from "./deleteOrganizationInvite";
import fetchOrganization from "./fetchOrganization";
import findFlows from "./findFlows";
import findOrganizationApiKeys from "./findOrganizationApiKeys";
import findOrganizationInvites from "./findOrganizationInvites";
import findOrganizationMembers from "./findOrganizationMembers";
import removeOrganizationMember from "./removeOrganizationMember";
import revokeOrganizationApiKey from "./revokeOrganizationApiKey";
import updateOrganization from "./updateOrganization";
import updateOrganizationMember from "./updateOrganizationMember";

const organizationsRouter = Router({
  mergeParams: true,
});

organizationsRouter.post("/", requireLogin(createOrganization));
organizationsRouter.get("/:organizationId", requireLogin(fetchOrganization));
organizationsRouter.patch("/:organizationId", requireLogin(updateOrganization));
organizationsRouter.delete("/:organizationId", requireLogin(deleteOrganization));
organizationsRouter.get(
  "/:organizationId/api-keys",
  requireLogin(findOrganizationApiKeys),
);
organizationsRouter.post(
  "/:organizationId/api-keys",
  requireLogin(createOrganizationApiKey),
);
organizationsRouter.delete(
  "/:organizationId/api-keys/:apiKeyId",
  requireLogin(revokeOrganizationApiKey),
);
organizationsRouter.get("/:organizationId/flows", requireLogin(findFlows));
organizationsRouter.get(
  "/:organizationId/members",
  requireLogin(findOrganizationMembers),
);
organizationsRouter.patch(
  "/:organizationId/members/:userId",
  requireLogin(updateOrganizationMember),
);
organizationsRouter.delete(
  "/:organizationId/members/:userId",
  requireLogin(removeOrganizationMember),
);
organizationsRouter.get(
  "/:organizationId/invites",
  requireLogin(findOrganizationInvites),
);
organizationsRouter.post(
  "/:organizationId/invites",
  requireLogin(createOrganizationInvite),
);
organizationsRouter.delete(
  "/:organizationId/invites/:inviteId",
  requireLogin(deleteOrganizationInvite),
);

export default organizationsRouter;
