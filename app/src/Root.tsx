import { Outlet } from "react-router-dom";

import { PageMessage } from "./components/ui/PageMessage";
import useSession from "./hooks/useSession";
import TopNavigation from "./components/TopNavigation";

const Root = () => {
  const { isPending } = useSession();

  if (isPending) {
    return (
      <PageMessage
        description="Checking for an existing session before the app unlocks public or protected routes."
        eyebrow="Loading"
        title="Preparing Project CB"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <TopNavigation />
      <Outlet />
    </div>
  );
};

export default Root;
