import { Outlet } from "react-router-dom";

import { Button } from "@app/components/ui/Button";
import { PageMessage } from "@app/components/ui/PageMessage";
import { useAppBootstrap } from "@app/features/system/useAppBootstrap";

export const RootLayout = () => {
  const { error, isBootstrapping, refetch, session } = useAppBootstrap();

  if (isBootstrapping) {
    return (
      <PageMessage
        description="Checking for an existing session before the app unlocks public or protected routes."
        eyebrow="Loading"
        title="Preparing Project CB"
      />
    );
  }

  if (error) {
    return (
      <PageMessage
        action={
          <Button onClick={() => void refetch()} variant="secondary">
            Retry
          </Button>
        }
        description="We could not load the current session state from the backend."
        eyebrow="Unavailable"
        title="Project CB could not start"
      />
    );
  }

  return <Outlet context={{ session }} />;
};
