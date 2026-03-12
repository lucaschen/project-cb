import type { OrganizationPayload } from "@packages/shared/http/schemas/organizations/common";
import type { DeleteCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/deleteCurrentSession";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import type { UseMutationResult } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";

type RootContext = {
  activeOrganization: OrganizationPayload | null;
  organizations: OrganizationPayload[];
  logoutMutation: UseMutationResult<
    DeleteCurrentSessionOutput | void,
    Error,
    void,
    unknown
  >;
  sessionData: GetCurrentSessionOutput | null;
};

const useRootContext = () => {
  return useOutletContext<RootContext>();
};

export default useRootContext;
