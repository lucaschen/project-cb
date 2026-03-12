import type { ZodType } from "zod";

import { env } from "@app/lib/env";

type ApiRequestOptions<TSchema> = {
  body?: unknown;
  method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
  path: string;
  schema?: ZodType<TSchema>;
  signal?: AbortSignal;
};

type ErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  body?: ErrorBody | null;
  status: number;

  constructor(message: string, status: number, body?: ErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value) as ErrorBody;
  } catch {
    return null;
  }
};

export const apiRequest = async <TSchema = null>({
  body,
  method,
  path,
  schema,
  signal,
}: ApiRequestOptions<TSchema>) => {
  const response = await fetch(new URL(path, env.apiBaseUrl).toString(), {
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method,
    signal,
  });

  const rawBody = await response.text();
  const parsedBody = rawBody ? tryParseJson(rawBody) : null;

  if (!response.ok) {
    throw new ApiError(
      parsedBody?.message || `Request failed with status ${response.status}.`,
      response.status,
      parsedBody,
    );
  }

  if (!schema) {
    return null;
  }

  return schema.parse(parsedBody);
};
