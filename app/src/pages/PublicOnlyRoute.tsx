import useSession from "@app/hooks/useSession";
import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
  const { sessionData } = useSession();

  if (sessionData) {
    return <Navigate replace to="/flows" />;
  }

  return <Outlet />;
};
