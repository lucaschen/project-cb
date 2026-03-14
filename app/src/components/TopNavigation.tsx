import { AppLogo } from "@app/components/ui/AppLogo";
import { Button } from "@app/components/ui/Button";
import useLogout from "@app/hooks/useLogout";
import { path as flowDetailsPath } from "@app/pages/flows/FlowDetails";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { path as loginPath } from "@app/pages/Login";
import { path as organizationOnboardingPath } from "@app/pages/organizations/OrganizationOnboarding";
import { path as signupPath } from "@app/pages/Signup";
import type { OrganizationSummaryType } from "@packages/shared/http/schemas/organizations/common";
import type { GetCurrentSessionOutput } from "@packages/shared/http/schemas/sessions/getCurrentSession";
import { Link, NavLink, useLocation, useMatch } from "react-router-dom";

type TopNavigationProps = {
  activeOrganization: OrganizationSummaryType | null;
  sessionData: GetCurrentSessionOutput | null;
};

const publicNavItems = [
  {
    label: "Login",
    to: loginPath,
  },
  {
    label: "Signup",
    to: signupPath,
  },
];

const protectedNavItems = [
  {
    label: "Flows",
    to: flowsListPath,
  },
];

const TopNavigation = ({
  activeOrganization,
  sessionData,
}: TopNavigationProps) => {
  const { mutate: logout, isPending: isLogoutPending } = useLogout();
  const location = useLocation();
  const isFlowDetailsRoute = useMatch(flowDetailsPath);
  const isAuthenticated = Boolean(sessionData);
  const navItems =
    isAuthenticated && !activeOrganization
      ? [
          ...protectedNavItems,
          {
            label: "Org Onboarding",
            to: organizationOnboardingPath,
          },
        ]
      : isAuthenticated
        ? protectedNavItems
        : publicNavItems;

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-white/10 bg-slate-950/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/">
              <AppLogo />
            </Link>
            <nav className="flex flex-wrap gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-1.5 text-sm font-medium leading-5 transition ${
                      isActive
                        ? "border-sky-300/50 bg-sky-300/15 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-sky-300/30 hover:text-white"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {isAuthenticated && isFlowDetailsRoute ? (
              <Link to={flowsListPath}>
                <Button className="px-3 py-2 text-sm" variant="secondary">
                  Back to flows
                </Button>
              </Link>
            ) : null}
            {isAuthenticated ? (
              <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-sm leading-5 text-slate-100">
                Signed in as{" "}
                <span className="font-medium text-white">
                  {sessionData?.email ?? "unknown user"}
                </span>
              </div>
            ) : null}
            {isAuthenticated && activeOrganization ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm leading-5 text-slate-100">
                Active org:{" "}
                <span className="font-medium text-white">
                  {activeOrganization.name}
                </span>
              </div>
            ) : null}
            {isAuthenticated ? (
              <Button
                className="px-3 py-2 text-sm"
                isBusy={isLogoutPending}
                onClick={() => logout()}
                variant="ghost"
              >
                Sign out
              </Button>
            ) : null}
          </div>
        </div>
        {isAuthenticated &&
        !activeOrganization &&
        location.pathname !== organizationOnboardingPath ? (
          <p className="text-sm leading-6 text-slate-400">
            No active organization is set. Continue into organization onboarding
            before using protected workspace routes.
          </p>
        ) : null}
      </div>
    </header>
  );
};

export default TopNavigation;
