import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStep from "./createStep";
import elementsRouter from "./elements";
import findSteps from "./findSteps";

const stepsRouter = Router({ mergeParams: true });

stepsRouter.get("/", requireLogin(findSteps));
stepsRouter.post("/", requireLogin(createStep));
stepsRouter.use("/:stepId/elements", elementsRouter);

export default stepsRouter;
