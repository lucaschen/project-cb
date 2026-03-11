import type { ReactNode } from "react";

type PageMessageProps = {
  action?: ReactNode;
  eyebrow?: string;
  description: string;
  title: string;
};

export const PageMessage = ({
  action,
  description,
  eyebrow,
  title,
}: PageMessageProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-white/10 bg-slate-950/70 p-10 text-center shadow-panel backdrop-blur">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
          {description}
        </p>
        {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
};
