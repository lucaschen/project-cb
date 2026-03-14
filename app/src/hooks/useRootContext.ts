import type { OrganizationSummaryType } from "@packages/shared/http/schemas/organizations/common";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { useOutletContext } from "react-router-dom";

type RootContext = {
  activeOrganization: OrganizationSummaryType | null;
  organizations: OrganizationSummaryType[];
  sessionData: GetCurrentSessionOutput | null;
};

const useRootContext = () => {
  return useOutletContext<RootContext>();
};

export default useRootContext;
