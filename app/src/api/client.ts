import { envs } from "@app/config/envs";
import axios from "axios";

const { VITE_API_BASE_URL } = envs;

type ApiRequestOptions = {
  body?: unknown;
  method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
  path: string;
  signal?: AbortSignal;
};

const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function apiRequest({
  body,
  method,
  path,
  signal,
}: ApiRequestOptions): Promise<unknown> {
  const response = await apiClient.request({
    data: body,
    method,
    signal,
    url: path,
  });

  return response.data;
}
