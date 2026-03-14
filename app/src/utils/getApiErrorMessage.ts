import { AxiosError } from "axios";

type ApiErrorCopy = {
  byStatus?: Partial<Record<number, string>>;
  default: string;
};

const getResponseMessage = (error: AxiosError) => {
  const responseData = error.response?.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    "message" in responseData &&
    typeof responseData.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  return undefined;
};

export const getApiErrorMessage = (error: unknown, copy: ApiErrorCopy) => {
  if (!(error instanceof AxiosError)) {
    return copy.default;
  }

  const statusMessage = error.response?.status
    ? copy.byStatus?.[error.response.status]
    : undefined;

  return statusMessage ?? getResponseMessage(error) ?? copy.default;
};
