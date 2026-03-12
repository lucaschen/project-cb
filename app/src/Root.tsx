import { Outlet } from "react-router-dom";

import TopNavigation from "./components/TopNavigation";
import { PageMessage } from "./components/ui/PageMessage";
import useCurrentUserOrganizations from "./hooks/useCurrentUserOrganizations";
import useSession from "./hooks/useSession";

const Root = () => {
  const { isPending, logoutMutation, sessionData } = useSession();
  const {
    activeOrganization,
    isPending: areOrganizationsPending,
    organizations,
  } = useCurrentUserOrganizations({
    isSessionPending: isPending,
    sessionData,
  });

  if (isPending || (sessionData && areOrganizationsPending)) {
    return (
      <PageMessage
        description="Checking your session and organization access before the app unlocks the correct routes."
        eyebrow="Loading"
        title="Preparing Project CB"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <TopNavigation />
      <Outlet
        context={{
          activeOrganization,
          logoutMutation,
          organizations,
          sessionData,
        }}
      />
    </div>
  );
};

export default Root;
