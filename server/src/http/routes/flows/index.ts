import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createFlow from "./createFlow";
import fetchFlow from "./fetchFlow";
import stepsRouter from "./steps";
import updateBuilder from "./updateBuilder";
import updateFlowMetadata from "./updateFlowMetadata";

const flowsRouter = Router({
  mergeParams: true,
});

flowsRouter.use("/:flowId/steps", stepsRouter);
flowsRouter.put("/:flowId/builder", requireLogin(updateBuilder));
flowsRouter.get("/:flowId", requireLogin(fetchFlow));
flowsRouter.patch("/:flowId", requireLogin(updateFlowMetadata));
flowsRouter.post("/", requireLogin(createFlow));

export default flowsRouter;
