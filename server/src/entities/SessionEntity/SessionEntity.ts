import { staticImplements, type StaticMethods } from "../types";
import fetchUserEntity from "./instanceMethods/fetchUserEntity";
import getPayload from "./instanceMethods/getPayload";
import createFromCredentials from "./staticMethods/createFromCredentials";
import createFromToken from "./staticMethods/createFromToken";
import type { SessionPayload } from "./types";
import { decodeSessionToken } from "./utils";

@staticImplements<StaticMethods<typeof SessionEntity, SessionEntity>>()
export default class SessionEntity {
  payload: SessionPayload;
  token: string;

  constructor(token: string) {
    this.payload = decodeSessionToken(token);
    this.token = token;
  }

  // PARTITION: Static methods
  static createFromCredentials = createFromCredentials;
  static createFromToken = createFromToken;

  // PARTITION: Instance methods
  fetchUserEntity = fetchUserEntity;
  getPayload = getPayload;
}
