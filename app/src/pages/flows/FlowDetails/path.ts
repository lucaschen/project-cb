import { generatePath } from "react-router-dom";

export const path = "/flows/:flowId";

export const getPath = (flowId: string) => {
  return generatePath(path, { flowId });
};
