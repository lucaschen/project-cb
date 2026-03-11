import type { SessionPayload } from "@packages/shared/http/schemas/sessions/common";

import { useOutletContext } from "react-router-dom";

export type RootLayoutContext = {
  session: SessionPayload | null;
};

export const useRootLayoutContext = () => {
  return useOutletContext<RootLayoutContext>();
};
