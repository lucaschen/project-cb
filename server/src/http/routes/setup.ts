import { type Express, Router } from "express";

const setupRoutes = (app: Express) => {
  const router = Router();

  router.get("/healthcheck", (_req, res) => {
    res.json({ message: "Alive and well!" });
  });

  app.use(router);
};

export default setupRoutes;
