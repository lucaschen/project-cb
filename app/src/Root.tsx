import { Outlet } from "react-router-dom";

import { PageMessage } from "./components/ui/PageMessage";
import useSession from "./hooks/useSession";

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

  return <Outlet />;
};

export default Root;
