import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createStepElement from "../createStepElement";
import fetchStepElements from "./fetchStepElements";
import updateStepElements from "./updateStepElements";

const elementsRouter = Router({ mergeParams: true });

elementsRouter.get("/", requireLogin(fetchStepElements));
elementsRouter.post("/", requireLogin(createStepElement));
elementsRouter.put("/", requireLogin(updateStepElements));

export default elementsRouter;
