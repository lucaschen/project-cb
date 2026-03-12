import "./global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import FlowsList, { path as flowsListPath } from "./pages/flows/FlowsList";
import Home, { path as homePath } from "./pages/Home";
import Login, { path as loginPath } from "./pages/Login";
import NotFound from "./pages/NotFound";
import OrganizationOnboarding, {
  path as organizationOnboardingPath,
} from "./pages/organizations/OrganizationOnboarding";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { PublicOnlyRoute } from "./pages/PublicOnlyRoute";
import Signup, { path as signupPath } from "./pages/Signup";
import Root from "./Root";
import { queryClient } from "./utils/queryClient";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            index: true,
            path: homePath,
            element: <Home />,
          },
          {
            path: loginPath,
            element: <Login />,
          },
          {
            path: signupPath,
            element: <Signup />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: flowsListPath,
            element: <FlowsList />,
          },
          {
            path: organizationOnboardingPath,
            element: <OrganizationOnboarding />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
