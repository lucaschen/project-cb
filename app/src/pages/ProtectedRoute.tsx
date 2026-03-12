import useRootContext from "@app/hooks/useRootContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const rootContext = useRootContext();
  const { sessionData } = rootContext;

  if (!sessionData) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet context={rootContext} />;
};
