import { randomBytes } from "crypto";

export const generateApiKey = () => {
  return "org_" + randomBytes(32).toString("base64url"); // ~256 bits
};
