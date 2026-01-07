import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Express } from "express";

import { envs } from "~src/config/envs";

import injectExpressContextEntity from "./injectExpressContextEntity";

const setupMiddleware = (app: Express) => {
  app.use(bodyParser.json());
  app.use(
    cors({
      credentials: true,
      origin: envs.CORS_ALLOWED_ORIGINS,
    })
  );
  app.use(cookieParser());
  app.use(injectExpressContextEntity);
};

export default setupMiddleware;
