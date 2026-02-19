import { Router } from "express";

import createUser from "./createUser";
import findOrganizationsForCurrentUser from "./findOrganizationsForCurrentUser";

const usersRouter = Router();

usersRouter.post("/", createUser);
usersRouter.get("/current/organizations", findOrganizationsForCurrentUser);

export default usersRouter;
