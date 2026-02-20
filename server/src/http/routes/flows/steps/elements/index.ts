import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStepElement from "./createStepElement";

const stepElementsRouter = Router({ mergeParams: true });

stepElementsRouter.post("/", requireLogin(createStepElement));

export default stepElementsRouter;