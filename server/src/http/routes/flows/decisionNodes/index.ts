import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createDecisionNode from "./createDecisionNode";

const decisionNodeRouter = Router({ mergeParams: true });

decisionNodeRouter.post("/", requireLogin(createDecisionNode));

export default decisionNodeRouter;
