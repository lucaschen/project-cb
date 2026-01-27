import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStep from "./createStep";

const stepsRouter = Router({ mergeParams: true });

stepsRouter.post("/", requireLogin(createStep));

export default stepsRouter;
