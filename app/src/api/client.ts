import { envs } from "@app/config/envs";
import type { ZodType } from "zod";

const { API_BASE_URL } = envs;

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

export const apiRequest = async <TSchema>({
  body,
  method,
  path,
  schema,
  signal,
}: ApiRequestOptions<TSchema>) => {
  const response = await fetch(new URL(path, API_BASE_URL).toString(), {
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

  if (!schema || !rawBody) {
    return undefined as TSchema;
  }

  return schema.parse(parsedBody);
};
