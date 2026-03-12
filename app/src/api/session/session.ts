import {
  createSessionInput,
  createSessionOutput,
} from "@packages/shared/http/schemas/sessions/createSession";
import { deleteCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/deleteCurrentSession";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { getCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import {
  createUserInput,
  createUserOutput,
} from "@packages/shared/http/schemas/users/createUser";
import { AxiosError } from "axios";
import { z } from "zod";

import { apiRequest } from "../client";
import { enforceStrictSchema } from "../enforceSchema";

export const createSession = enforceStrictSchema({
  handler: (input) =>
    apiRequest({
      body: input,
      method: "POST",
      path: "/sessions",
    }),
  inputSchema: createSessionInput,
  outputSchema: createSessionOutput,
});

const getCurrentSessionHandler = enforceStrictSchema({
  handler: () =>
    apiRequest({
      method: "GET",
      path: "/sessions/current",
    }),
  inputSchema: z.undefined(),
  outputSchema: getCurrentSessionOutput,
});

export const getCurrentSession =
  async (): Promise<GetCurrentSessionOutput | null> => {
    try {
      return await getCurrentSessionHandler(undefined);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }

      throw error;
    }
  };

const deleteCurrentSessionHandler = enforceStrictSchema({
  handler: () =>
    apiRequest({
      method: "DELETE",
      path: "/sessions/current",
    }),
  inputSchema: z.undefined(),
  outputSchema: deleteCurrentSessionOutput,
});

export const deleteCurrentSession = async () => {
  await deleteCurrentSessionHandler(undefined);
};

export const createUser = enforceStrictSchema({
  handler: (input) =>
    apiRequest({
      body: input,
      method: "POST",
      path: "/users",
    }),
  inputSchema: createUserInput,
  outputSchema: createUserOutput,
});
