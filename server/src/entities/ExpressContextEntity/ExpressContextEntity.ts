import type { Response } from "express-serve-static-core";

import type SessionEntity from "../SessionEntity/SessionEntity";
import { staticImplements, type StaticMethods } from "../types";
import deleteSession from "./instanceMethods/deleteSession";
import setSession from "./instanceMethods/setSession";
import create from "./staticMethods/create";

@staticImplements<
  StaticMethods<typeof ExpressContextEntity, ExpressContextEntity>
>()
export default class ExpressContextEntity {
  res: Response;
  sessionEntity: SessionEntity | null;

  constructor({
    res,
    sessionEntity,
  }: {
    res: Response;
    sessionEntity: SessionEntity | null;
  }) {
    this.res = res;
    this.sessionEntity = sessionEntity;
  }

  // PARTITION: Static methods
  static create = create;

  // PARTITION: Instance methods
  deleteSession = deleteSession;
  setSession = setSession;
}
