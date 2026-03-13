import express from "express";
import { createServer } from "http";

import { envs } from "~src/config/envs";

import handleErrors from "./middleware/handleErrors";
import setupMiddleware from "./middleware/setup";
import setupRoutes from "./routes/setup";

const { PORT } = envs;

export const createHttpApp = () => {
  const app = express();

  setupMiddleware(app);
  setupRoutes(app);
  handleErrors(app);

  return app;
};

const setupHttpServer = () =>
  new Promise<void>((resolve) => {
    const httpServer = createServer(createHttpApp());

    httpServer.listen(PORT, resolve);
  });

export default setupHttpServer;
