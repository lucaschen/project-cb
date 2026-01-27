import { Router } from "express";

import createSession from "./createSession";
import deleteCurrentSession from "./deleteCurrentSession";
import getCurrentSession from "./getCurrentSession";

const sessionsRouter = Router();

sessionsRouter.post("/", createSession);
sessionsRouter.get("/current", getCurrentSession);
sessionsRouter.delete("/current", deleteCurrentSession);

export default sessionsRouter;
