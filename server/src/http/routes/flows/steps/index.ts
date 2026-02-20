import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStep from "./createStep";
import stepElementsRouter from "./elements";

const stepsRouter = Router({ mergeParams: true });

stepsRouter.post("/", requireLogin(createStep));
stepsRouter.use("/:stepId/elements", stepElementsRouter);

export default stepsRouter;
