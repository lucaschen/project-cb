import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createUser from "./createUser";
import findOrganizationsForCurrentUser from "./findOrganizationsForCurrentUser";

const usersRouter = Router();

usersRouter.post("/", createUser);
usersRouter.get(
  "/current/organizations",
  requireLogin(findOrganizationsForCurrentUser),
);

export default usersRouter;
