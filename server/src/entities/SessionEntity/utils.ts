import {
  type SessionPayload,
  sessionPayload as sessionPayloadSchema,
} from "@packages/shared/http/schemas/sessions/common";
import jwt from "jsonwebtoken";

import { envs } from "~src/config/envs";

export const createSessionToken = (sessionPayload: SessionPayload) => {
  const token = jwt.sign(sessionPayload, envs.JWT_SECRET);

  return token;
};

export const decodeSessionToken = (maybeSessionToken: string) => {
  const decodedPayload = jwt.verify(maybeSessionToken, envs.JWT_SECRET);

  const sessionPayload = sessionPayloadSchema.parse(decodedPayload);

  return sessionPayload;
};
