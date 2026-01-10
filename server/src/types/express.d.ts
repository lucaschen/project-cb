import type ExpressContextEntity from "~src/entities/ExpressContextEntity/ExpressContextEntity";

declare global {
  namespace Express {
    export interface Request {
      context: ExpressContextEntity;
    }
  }
}
