import type ExpressContextEntity from "~entities/ExpressContextEntity/ExpressContextEntity";

declare global {
  namespace Express {
    export interface Request {
      context: ExpressContextEntity;
    }
  }
}
