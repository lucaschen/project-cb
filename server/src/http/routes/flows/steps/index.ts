import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStep from "./createStep";
import createStepElement from "./createStepElement";
import findSteps from "./findSteps";
import saveSteps from "./saveSteps";

const stepsRouter = Router({ mergeParams: true });

stepsRouter.get("/", requireLogin(findSteps));
stepsRouter.post("/", requireLogin(createStep));
stepsRouter.put("/", requireLogin(saveSteps));
stepsRouter.use("/:stepId/elements", createStepElement);

export default stepsRouter;
