import { Link } from "react-router-dom";

import { Button } from "@app/components/ui/Button";

import { AuthShell } from "./AuthShell";

export const LoginPage = () => {
  return (
    <AuthShell
      cta={
        <div className="space-y-3">
          <p className="font-medium text-white">Foundation checkpoint</p>
          <p>
            The route exists now so FE 02 can drop real auth onto a stable router, provider,
            and styling foundation instead of rebuilding the app shell later.
          </p>
        </div>
      }
      description="This login route is scaffolded in FE 01. Real authentication wiring lands in the next branch."
      eyebrow="FE 01 Foundation"
      footerLabel="Need an account?"
      footerText="Create one"
      footerTo="/signup"
      title="The frontend foundation is ready for authentication."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Login route placeholder</h2>
        <p className="text-sm leading-6 text-slate-300">
          FE 02 will replace this placeholder with email/password sign-in, session bootstrap,
          and route guard behavior.
        </p>
      </div>
      <div className="mt-8 space-y-4 rounded-[24px] border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm leading-6 text-slate-300">
        <p>Planned next in FE 02:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-sky-300">
          <li>Login form and inline validation</li>
          <li>Session bootstrap on app load</li>
          <li>Protected route gating</li>
        </ul>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <Button className="flex-1" disabled>
          Sign in coming next
        </Button>
        <Link className="text-sm font-medium text-sky-200 transition hover:text-sky-100" to="/signup">
          Go to sign up
        </Link>
      </div>
    </AuthShell>
  );
};
