import useRootContext from "@app/hooks/useRootContext";
import { Navigate, Outlet } from "react-router-dom";

import { path as homePath } from "./Home";

export const PublicOnlyRoute = () => {
  const rootContext = useRootContext();
  const { sessionData } = rootContext;

  if (sessionData) {
    // TODO: handle saved redirects in url
    return <Navigate replace to={homePath} />;
  }

  return <Outlet context={rootContext} />;
};
