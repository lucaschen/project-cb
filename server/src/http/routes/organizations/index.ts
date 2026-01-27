import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createOrganization from "./createOrganization";

const organizationsRouter = Router({
  mergeParams: true,
});

organizationsRouter.post("/", requireLogin(createOrganization));

export default organizationsRouter;
