import { type Express, Router } from "express";

import flowsRouter from "./flows";
import organizationsRouter from "./organizations";
import sessionsRouter from "./sessions";
import usersRouter from "./users";

const setupRoutes = (app: Express) => {
  const router = Router();

  router.get("/healthcheck", (_req, res) => {
    res.json({ message: "Alive and well!" });
  });
  router.use("/flows", flowsRouter);
  router.use("/organizations", organizationsRouter);
  router.use("/sessions", sessionsRouter);
  router.use("/users", usersRouter);

  app.use(router);
};

export default setupRoutes;
