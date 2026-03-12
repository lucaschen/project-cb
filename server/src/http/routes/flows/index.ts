import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createFlow from "./createFlow";
import decisionNodeRouter from "./decisionNodes";
import fetchFlow from "./fetchFlow";
import stepsRouter from "./steps";

const flowsRouter = Router({
  mergeParams: true,
});

flowsRouter.use("/:flowId/decision-nodes", decisionNodeRouter);
flowsRouter.use("/:flowId/steps", stepsRouter);
flowsRouter.get("/:flowId", requireLogin(fetchFlow));
flowsRouter.post("/", requireLogin(createFlow));

export default flowsRouter;
