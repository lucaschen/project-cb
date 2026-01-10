import express from "express";
import { createServer } from "http";

import { envs } from "~src/config/envs";

import handleErrors from "./middleware/handleErrors";
import setupMiddleware from "./middleware/setup";
import setupRoutes from "./routes/setup";

const { PORT } = envs;

const setupHttpServer = () =>
  new Promise<void>((resolve) => {
    const app = express();
    const httpServer = createServer(app);

    setupMiddleware(app);

    setupRoutes(app);

    handleErrors(app);

    httpServer.listen(PORT, resolve);
  });

export default setupHttpServer;
