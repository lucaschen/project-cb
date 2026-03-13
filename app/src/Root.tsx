import { Outlet, useMatch } from "react-router-dom";

import TopNavigation from "./components/TopNavigation";
import { PageMessage } from "./components/ui/PageMessage";
import useCurrentUserOrganizations from "./hooks/useCurrentUserOrganizations";
import useSession from "./hooks/useSession";
import { path as flowDetailsPath } from "./pages/flows/FlowDetails";

const Root = () => {
  const isFlowDetailsRoute = useMatch(flowDetailsPath);
  const { isPending, sessionData } = useSession();
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
    <div
      className={
        isFlowDetailsRoute
          ? "flex h-screen flex-col overflow-hidden"
          : "min-h-screen"
      }
    >
      <TopNavigation
        activeOrganization={activeOrganization}
        sessionData={sessionData}
      />
      <div
        className={isFlowDetailsRoute ? "min-h-0 flex-1 overflow-hidden" : ""}
      >
        <Outlet
          context={{
            activeOrganization,
            organizations,
            sessionData,
          }}
        />
      </div>
    </div>
  );
};

export default Root;
