import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createOrganization from "./createOrganization";
import findFlows from "./findFlows";

const organizationsRouter = Router({
  mergeParams: true,
});

organizationsRouter.post("/", requireLogin(createOrganization));
organizationsRouter.get("/:organizationId/flows", requireLogin(findFlows));

export default organizationsRouter;
