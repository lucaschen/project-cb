import { Outlet } from "react-router-dom";

import { AppNav } from "@app/components/ui/AppNav";

export const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <AppNav />
      <Outlet />
    </div>
  );
};
