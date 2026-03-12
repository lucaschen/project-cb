import { Button } from "@app/components/ui/Button";
import { EmptyState } from "@app/components/ui/EmptyState";
import { SectionLabel } from "@app/components/ui/SectionLabel";
import useRootContext from "@app/hooks/useRootContext";
import { Navigate } from "react-router-dom";

const FlowsList = () => {
  const { activeOrganization, logoutMutation, sessionData } = useRootContext();

  if (!sessionData) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <SectionLabel>Protected Area</SectionLabel>
          <h1 className="text-3xl font-semibold text-white">Flows workspace</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            Auth, org-aware redirects, and active-org persistence are in place.
            Flow list and metadata editing remain deferred until the missing
            backend APIs exist.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-slate-300 md:items-end">
          <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-2">
            Signed in as{" "}
            <span className="font-medium text-white">
              {sessionData.email ?? "unknown user"}
            </span>
          </div>
          {activeOrganization ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              Active org:{" "}
              <span className="font-medium text-white">
                {activeOrganization.name}
              </span>
            </div>
          ) : null}
          <Button
            isBusy={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            variant="secondary"
          >
            Sign out
          </Button>
        </div>
      </header>
      <div className="mt-10">
        <EmptyState
          description="The route, auth gating, and organization context are ready. The actual flow list UI is the next ticket once list APIs are available."
          title="Flow list coming next"
        />
      </div>
    </main>
  );
};

export default FlowsList;
