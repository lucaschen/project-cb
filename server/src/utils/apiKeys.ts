import { randomBytes } from "crypto";

export const generateOrganizationApiKey = () => {
  return "org_" + randomBytes(32).toString("base64url");
};

export const getOrganizationApiKeyPrefix = (apiKey: string) => {
  return apiKey.slice(0, 12);
};
