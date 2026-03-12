import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

import { AppLogo } from "./ui/AppLogo";
import { Card } from "./ui/Card";

type AuthShellProps = PropsWithChildren<{
  cta: ReactNode;
  description: string;
  eyebrow: string;
  footerLabel: string;
  footerTo: string;
  footerText: string;
  title: string;
}>;

export const AuthShell = ({
  children,
  cta,
  description,
  eyebrow,
  footerLabel,
  footerText,
  footerTo,
  title,
}: AuthShellProps) => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-slate-950/50 p-8 shadow-panel backdrop-blur">
          <div className="space-y-8">
            <AppLogo />
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
                {eyebrow}
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-300">
                {description}
              </p>
            </div>
          </div>
          <div className="mt-12 rounded-[24px] border border-sky-300/15 bg-sky-300/10 p-5 text-sm leading-6 text-slate-100">
            {cta}
          </div>
        </section>
        <Card className="self-center">
          {children}
          <p className="mt-8 text-sm text-slate-400">
            {footerLabel}{" "}
            <Link
              className="font-medium text-sky-200 transition hover:text-sky-100"
              to={footerTo}
            >
              {footerText}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
};
