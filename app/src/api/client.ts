import { envs } from "@app/config/envs";
import type { ZodType } from "zod";

const { VITE_API_BASE_URL } = envs;

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
  const response = await fetch(new URL(path, VITE_API_BASE_URL), {
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
    return null;
  }

  if (!schema) {
    return null;
  }

  return schema.parse(parsedBody);
};
