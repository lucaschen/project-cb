import type { CreateSessionInput } from "@packages/shared/http/schemas/sessions/createSession";
import { createSessionOutput } from "@packages/shared/http/schemas/sessions/createSession";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { getCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { createUserOutput } from "@packages/shared/http/schemas/users/createUser";
import type { CreateUserInput } from "@packages/shared/http/schemas/users/createUser";

import { ApiError, apiRequest } from "@app/lib/api/client";

export const createSession = async (input: CreateSessionInput) => {
  return apiRequest({
    body: input,
    method: "POST",
    path: "/sessions",
    schema: createSessionOutput,
  });
};

export const getCurrentSession = async (): Promise<GetCurrentSessionOutput | null> => {
  try {
    return await apiRequest({
      method: "GET",
      path: "/sessions/current",
      schema: getCurrentSessionOutput,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
};

export const deleteCurrentSession = async () => {
  await apiRequest({
    method: "DELETE",
    path: "/sessions/current",
  });
};

export const createUser = async (input: CreateUserInput) => {
  return apiRequest({
    body: input,
    method: "POST",
    path: "/users",
    schema: createUserOutput,
  });
};
