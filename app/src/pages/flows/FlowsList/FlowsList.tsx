import { createFlow, getOrganizationFlows } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { EmptyState } from "@app/components/ui/EmptyState";
import { FormField } from "@app/components/ui/FormField";
import { PageMessage } from "@app/components/ui/PageMessage";
import { SectionLabel } from "@app/components/ui/SectionLabel";
import { TextAreaField } from "@app/components/ui/TextAreaField";
import useRootContext from "@app/hooks/useRootContext";
import { toSlug } from "@app/utils/slug";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { getPath as getFlowDetailsPath } from "../FlowDetails";

const validateFlowName = (name: string) => {
  const trimmedName = name.trim();
  const slug = toSlug(trimmedName);

  return {
    name: trimmedName ? "" : "Flow name is required.",
    slugError: slug ? "" : "Flow name must include letters or numbers.",
    trimmedName,
    slug,
  };
};

const normalizeDescription = (description: string) => {
  const trimmedDescription = description.trim();

  return trimmedDescription ? trimmedDescription : null;
};

const FlowsList = () => {
  const { activeOrganization, logoutMutation, sessionData } = useRootContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [flowDescription, setFlowDescription] = useState("");
  const [flowName, setFlowName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const flowsQuery = useQuery({
    enabled: Boolean(activeOrganization),
    queryFn: () =>
      getOrganizationFlows({
        organizationId: activeOrganization!.id,
      }),
    queryKey: activeOrganization
      ? queryKeys.organizationFlows(activeOrganization.id)
      : ["organizations", "unknown", "flows"],
    staleTime: Infinity,
  });

  const createFlowMutation = useMutation({
    mutationFn: createFlow,
    onSuccess: async (flow) => {
      if (activeOrganization) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.organizationFlows(activeOrganization.id),
        });
      }

      resetCreateFlowForm();
      navigate(getFlowDetailsPath(flow.id));
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 400) {
        setFormError(
          "Unable to create a flow with that name right now. Try a different name.",
        );
        return;
      }

      setFormError("Unable to create the flow right now. Try again.");
    },
  });

  if (!sessionData) {
    return <Navigate replace to="/" />;
  }

  if (!activeOrganization) {
    return (
      <PageMessage
        description="Project CB could not determine your active organization, so flow listing is unavailable until organization context is restored."
        eyebrow="Organization Required"
        title="Active organization missing"
      />
    );
  }

  const resetCreateFlowForm = () => {
    setFlowDescription("");
    setFlowName("");
    setFieldError("");
    setFormError("");
    setIsCreateOpen(false);
  };

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationResult = validateFlowName(flowName);
    setFieldError(validationResult.name || validationResult.slugError);
    setFormError("");

    if (validationResult.name || validationResult.slugError) {
      return;
    }

    await createFlowMutation.mutateAsync({
      description: normalizeDescription(flowDescription),
      name: validationResult.trimmedName,
      organizationId: activeOrganization.id,
      slug: validationResult.slug,
    });
  };

  const flows = flowsQuery.data ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <SectionLabel>Protected Area</SectionLabel>
          <h1 className="text-3xl font-semibold text-white">Flows workspace</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            Create flows for {activeOrganization.name}, review the available
            workspace, and continue into top-level metadata editing before the
            deeper builder experience lands.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-slate-300 md:items-end">
          <Button onClick={() => setIsCreateOpen((current) => !current)}>
            {isCreateOpen ? "Close create flow" : "Create flow"}
          </Button>
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
      {isCreateOpen ? (
        <Card className="mt-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Create a flow</h2>
            <p className="text-sm leading-6 text-slate-300">
              Create a flow in {activeOrganization.name} and continue straight
              into its metadata page.
            </p>
          </div>
          <form className="mt-6 space-y-5" onSubmit={handleCreateSubmit}>
            <FormField
              error={fieldError}
              id="flow-name"
              label="Flow name"
              onChange={(event) => setFlowName(event.target.value)}
              placeholder="Customer intake"
              value={flowName}
            />
            <TextAreaField
              helperText="Optional context for internal users. You can update this later."
              id="flow-description"
              label="Description"
              onChange={(event) => setFlowDescription(event.target.value)}
              placeholder="Capture the purpose of this flow and who it serves."
              value={flowDescription}
            />
            {formError ? (
              <p className="text-sm text-rose-300">{formError}</p>
            ) : null}
            <div className="flex gap-3">
              <Button isBusy={createFlowMutation.isPending} type="submit">
                Create flow
              </Button>
              <Button
                onClick={resetCreateFlowForm}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <div className="mt-10">
        {flowsQuery.isPending ? (
          <Card className="max-w-xl text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">
                Loading flows
              </h2>
              <p className="text-sm leading-6 text-slate-300">
                Fetching flows for {activeOrganization.name}.
              </p>
            </div>
          </Card>
        ) : flowsQuery.isError ? (
          <EmptyState
            action={
              <Button
                isBusy={flowsQuery.isFetching}
                onClick={() => void flowsQuery.refetch()}
                variant="secondary"
              >
                Retry
              </Button>
            }
            description={`Project CB could not load flows for ${activeOrganization.name}.`}
            title="Unable to load flows"
          />
        ) : flows.length === 0 ? (
          <EmptyState
            action={
              <Button onClick={() => setIsCreateOpen(true)}>
                Create your first flow
              </Button>
            }
            description={`No flows exist yet in ${activeOrganization.name}. Create one to start building.`}
            title="No flows yet"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {flows.map((flow) => (
              <Card className="p-6" key={flow.id}>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Flow
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    {flow.name}
                  </h2>
                  <p className="text-sm leading-6 text-slate-300">
                    Slug: <span className="text-slate-100">{flow.slug}</span>
                  </p>
                </div>
                <div className="mt-6">
                  <Link to={getFlowDetailsPath(flow.id)}>
                    <Button className="w-full" variant="secondary">
                      Open flow
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default FlowsList;
