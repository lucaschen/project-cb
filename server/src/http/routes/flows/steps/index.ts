import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStep from "./createStep";
import createStepElement from "./createStepElement";

const stepsRouter = Router({ mergeParams: true });

stepsRouter.post("/", requireLogin(createStep));
stepsRouter.use("/:stepId/elements", createStepElement);

export default stepsRouter;
