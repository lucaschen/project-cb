import { EmptyState } from "@app/components/ui/EmptyState";

export const FlowsPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-panel backdrop-blur">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
            FE 01 Foundation
          </p>
          <h1 className="text-3xl font-semibold text-white">Flows route scaffolded</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            This route exists now so later tickets can add auth gating and onboarding redirects
            without replacing the route tree again.
          </p>
        </div>
      </header>
      <div className="mt-10">
        <EmptyState
          description="The protected shell and real flow list behavior will be layered on top of this route in later tickets."
          title="Flows experience starts after auth"
        />
      </div>
    </main>
  );
};
