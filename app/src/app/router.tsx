import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { LoginPage } from "@app/features/auth/LoginPage";
import { ProtectedRoute } from "@app/features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@app/features/auth/PublicOnlyRoute";
import { SignupPage } from "@app/features/auth/SignupPage";
import { FlowsPage } from "@app/features/flows/FlowsPage";
import { OrganizationOnboardingPage } from "@app/features/organizations/OrganizationOnboardingPage";
import { NotFoundPage } from "@app/features/system/NotFoundPage";
import { RootLayout } from "@app/features/system/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/signup",
            element: <SignupPage />,
          },
        ],
      },
      {
        path: "/onboarding/organization",
        element: <OrganizationOnboardingPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/flows",
            element: <FlowsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
