import { Router } from "express";

import requireLogin from "~src/http/utils/requireLogin";

import createSession from "./createSession";
import deleteCurrentSession from "./deleteCurrentSession";
import getCurrentSession from "./getCurrentSession";

const sessionsRouter = Router();

sessionsRouter.post("/", createSession);
sessionsRouter.get("/current", getCurrentSession);
sessionsRouter.delete("/current", requireLogin(deleteCurrentSession));

export default sessionsRouter;
