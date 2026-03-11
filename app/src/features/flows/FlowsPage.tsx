import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@app/components/ui/Button";
import { EmptyState } from "@app/components/ui/EmptyState";
import { SectionLabel } from "@app/components/ui/SectionLabel";
import { deleteCurrentSession } from "@app/features/auth/api";
import { queryKeys } from "@app/lib/api/queryKeys";
import { useAppStore } from "@app/stores/appStore";
import { useRootLayoutContext } from "@app/features/system/useRootLayoutContext";

export const FlowsPage = () => {
  const queryClient = useQueryClient();
  const { clearCurrentSession } = useAppStore();
  const { session } = useRootLayoutContext();

  const logoutMutation = useMutation({
    mutationFn: deleteCurrentSession,
    onSettled: async () => {
      clearCurrentSession();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.session,
      });
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <SectionLabel>Protected Area</SectionLabel>
          <h1 className="text-3xl font-semibold text-white">Flows workspace</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            The auth flow is now real. This route is protected and confirms session bootstrap,
            public-route redirects, and logout behavior before org onboarding is added.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-slate-300 md:items-end">
          <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-2">
            Signed in as <span className="font-medium text-white">{session?.email ?? "unknown user"}</span>
          </div>
          <Button isBusy={logoutMutation.isPending} onClick={() => logoutMutation.mutate()} variant="secondary">
            Sign out
          </Button>
        </div>
      </header>
      <div className="mt-10">
        <EmptyState
          description="This branch stops at the protected shell. Organization-aware redirects and the onboarding form are added in FE 03."
          title="Protected route is live"
        />
      </div>
    </main>
  );
};
