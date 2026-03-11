import { Navigate, Outlet } from "react-router-dom";

import { useRootLayoutContext } from "@app/features/system/useRootLayoutContext";

export const ProtectedRoute = () => {
  const { session } = useRootLayoutContext();

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
};
