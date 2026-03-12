import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { LoginPage } from "@app/features/auth/LoginPage";
import { SignupPage } from "@app/features/auth/SignupPage";
import { FlowsPage } from "@app/features/flows/FlowsPage";
import { OrganizationOnboardingPage } from "@app/features/organizations/OrganizationOnboardingPage";
import { HomePage } from "@app/features/system/HomePage";
import { NotFoundPage } from "@app/features/system/NotFoundPage";
import { RootLayout } from "@app/features/system/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/onboarding/organization",
        element: <OrganizationOnboardingPage />,
      },
      {
        path: "/flows",
        element: <FlowsPage />,
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
