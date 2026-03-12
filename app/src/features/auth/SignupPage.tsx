import { Link } from "react-router-dom";

import { Button } from "@app/components/ui/Button";

import { AuthShell } from "./AuthShell";

export const SignupPage = () => {
  return (
    <AuthShell
      cta={
        <div className="space-y-3">
          <p className="font-medium text-white">Reserved route</p>
          <p>
            FE 02 will wire this page to the existing backend user and session endpoints once
            the foundation branch is reviewed.
          </p>
        </div>
      }
      description="The signup route is scaffolded in FE 01 so account creation can be added without changing the route tree again."
      eyebrow="FE 01 Foundation"
      footerLabel="Already have an account?"
      footerText="Sign in"
      footerTo="/login"
      title="The signup route is staged for FE 02."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Signup route placeholder</h2>
        <p className="text-sm leading-6 text-slate-300">
          FE 02 will add user creation, automatic login, and redirect handling here.
        </p>
      </div>
      <div className="mt-8 space-y-4 rounded-[24px] border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm leading-6 text-slate-300">
        <p>Planned next in FE 02:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-sky-300">
          <li>Create a user via the existing backend endpoint</li>
          <li>Auto-login after successful signup</li>
          <li>Route the user into the authenticated shell</li>
        </ul>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <Button className="flex-1" disabled>
          Sign up coming next
        </Button>
        <Link className="text-sm font-medium text-sky-200 transition hover:text-sky-100" to="/login">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
};
