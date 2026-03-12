import useSession from "@app/hooks/useSession";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { sessionData } = useSession();

  if (!sessionData) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
};
