import { AppLogo } from "@app/components/ui/AppLogo";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { path as loginPath } from "@app/pages/Login";
import { path as organizationOnboardingPath } from "@app/pages/organizations/OrganizationOnboarding";
import { path as signupPath } from "@app/pages/Signup";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Login",
    to: loginPath,
  },
  {
    label: "Signup",
    to: signupPath,
  },
  {
    label: "Org Onboarding",
    to: organizationOnboardingPath,
  },
  {
    label: "Flows",
    to: flowsListPath,
  },
];

const TopNavigation = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <AppLogo />
          <p className="hidden text-xs uppercase tracking-[0.3em] text-slate-400 sm:block">
            Deliverable Navigator
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `rounded-2xl border px-4 py-2 text-sm font-medium transition ${
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
    </header>
  );
};

export default TopNavigation;
