import { getFlow, updateFlowMetadata } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { EmptyState } from "@app/components/ui/EmptyState";
import { FormField } from "@app/components/ui/FormField";
import { PageMessage } from "@app/components/ui/PageMessage";
import { SectionLabel } from "@app/components/ui/SectionLabel";
import { TextAreaField } from "@app/components/ui/TextAreaField";
import useRootContext from "@app/hooks/useRootContext";
import { trimAndNullOnEmpty } from "@app/utils/string";
import type { FlowPayload } from "@packages/shared/http/schemas/flows/common";
import type { FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import type { FetchFlowOutput } from "@packages/shared/http/schemas/flows/fetchFlow";
import type { UpdateFlowMetadataInput } from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { path as flowsListPath } from "../FlowsList";

type FlowMetadataBaseline = {
  description: string | null;
  name: string;
};

type FlowMetadataFormProps = {
  activeOrganizationId: string | null;
  flow: FlowWithNodesType;
};

const FlowMetadataForm = ({
  activeOrganizationId,
  flow,
}: FlowMetadataFormProps) => {
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = useState<FlowMetadataBaseline>({
    description: flow.description,
    name: flow.name,
  });
  const [flowDescription, setFlowDescription] = useState(
    flow.description ?? "",
  );
  const [flowName, setFlowName] = useState(flow.name);
  const [formError, setFormError] = useState("");
  const [nameError, setNameError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const updateFlowMetadataMutation = useMutation({
    mutationFn: updateFlowMetadata,
    onSuccess: (updatedFlow) => {
      queryClient.setQueryData(
        queryKeys.flow(updatedFlow.id),
        (existingFlow: FetchFlowOutput | undefined) =>
          existingFlow
            ? {
                ...existingFlow,
                flow: {
                  ...existingFlow.flow,
                  ...updatedFlow,
                },
              }
            : existingFlow,
      );

      if (activeOrganizationId) {
        queryClient.setQueryData(
          queryKeys.organizationFlows(activeOrganizationId),
          (existingFlows: FlowPayload[] | undefined) =>
            existingFlows?.map((existingFlow) =>
              existingFlow.id === updatedFlow.id
                ? { ...existingFlow, ...updatedFlow }
                : existingFlow,
            ) ?? existingFlows,
        );
      }

      setBaseline({
        description: updatedFlow.description,
        name: updatedFlow.name,
      });
      setFlowDescription(updatedFlow.description ?? "");
      setFlowName(updatedFlow.name);
      setFormError("");
      setNameError("");
      setSaveMessage("Flow metadata saved.");
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 400) {
        setFormError(
          "Unable to save those metadata changes right now. Review the inputs and try again.",
        );
        return;
      }

      setFormError("Unable to save flow metadata right now. Try again.");
    },
  });

  const trimmedName = flowName.trim();
  const normalizedDescription = trimAndNullOnEmpty(flowDescription);
  const isDirty =
    trimmedName !== baseline.name ||
    normalizedDescription !== baseline.description;

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveMessage("");

    if (!trimmedName) {
      setNameError("Flow name is required.");
      return;
    }

    setFormError("");
    setNameError("");

    if (!isDirty) {
      return;
    }

    const input: UpdateFlowMetadataInput = {};

    if (trimmedName !== baseline.name) {
      input.name = trimmedName;
    }

    if (normalizedDescription !== baseline.description) {
      input.description = normalizedDescription;
    }

    await updateFlowMetadataMutation.mutateAsync({
      flowId: flow.id,
      input,
    });
  };

  return (
    <Card className="max-w-3xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{flow.name}</h2>
        <p className="text-sm leading-6 text-slate-300">
          Flow slug:{" "}
          <span className="font-medium text-slate-100">{flow.slug}</span>
        </p>
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSave}>
        <FormField
          error={nameError}
          id="flow-metadata-name"
          label="Flow name"
          onChange={(event) => setFlowName(event.target.value)}
          placeholder="Customer intake"
          value={flowName}
        />
        <TextAreaField
          helperText="Leave blank to remove the description."
          id="flow-metadata-description"
          label="Description"
          onChange={(event) => setFlowDescription(event.target.value)}
          placeholder="Capture the purpose of this flow and who it serves."
          value={flowDescription}
        />
        {formError ? (
          <p className="text-sm text-rose-300">{formError}</p>
        ) : null}
        {saveMessage ? (
          <p className="text-sm text-sky-300">{saveMessage}</p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            disabled={!isDirty}
            isBusy={updateFlowMetadataMutation.isPending}
            type="submit"
          >
            Save metadata
          </Button>
          <p className="text-sm text-slate-400">
            {isDirty
              ? "Unsaved changes are ready to save."
              : "No metadata changes to save."}
          </p>
        </div>
      </form>
    </Card>
  );
};

const FlowDetails = () => {
  const { activeOrganization, logoutMutation, sessionData } = useRootContext();
  const { flowId } = useParams<{ flowId: string }>();

  const flowQuery = useQuery({
    enabled: Boolean(flowId),
    queryFn: () =>
      getFlow({
        flowId: flowId!,
      }),
    queryKey: flowId ? queryKeys.flow(flowId) : ["flows", "unknown"],
    staleTime: Infinity,
  });

  if (!sessionData) {
    return <Navigate replace to="/" />;
  }

  if (!flowId) {
    return (
      <PageMessage
        action={
          <Link to={flowsListPath}>
            <Button variant="secondary">Back to flows</Button>
          </Link>
        }
        description="Project CB could not determine which flow to load."
        eyebrow="Flow Required"
        title="Flow ID missing"
      />
    );
  }

  const fetchStatus =
    flowQuery.error instanceof AxiosError
      ? flowQuery.error.response?.status
      : undefined;

  if (flowQuery.isError && (fetchStatus === 403 || fetchStatus === 404)) {
    return (
      <PageMessage
        action={
          <Link to={flowsListPath}>
            <Button variant="secondary">Back to flows</Button>
          </Link>
        }
        description="This flow could not be found or is not available to your current session."
        eyebrow="Unavailable Flow"
        title="Flow not accessible"
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <SectionLabel>Protected Area</SectionLabel>
          <h1 className="text-3xl font-semibold text-white">Flow metadata</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            Review and save the top-level details for this flow before the
            builder expands this route in FE 06.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-slate-300 md:items-end">
          <Link to={flowsListPath}>
            <Button variant="secondary">Back to flows</Button>
          </Link>
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
            variant="ghost"
          >
            Sign out
          </Button>
        </div>
      </header>
      <div className="mt-10">
        {flowQuery.isPending ? (
          <Card className="max-w-2xl">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">
                Loading flow metadata
              </h2>
              <p className="text-sm leading-6 text-slate-300">
                Fetching the latest metadata for this flow.
              </p>
            </div>
          </Card>
        ) : flowQuery.isError ? (
          <EmptyState
            action={
              <Button
                isBusy={flowQuery.isFetching}
                onClick={() => void flowQuery.refetch()}
                variant="secondary"
              >
                Retry
              </Button>
            }
            description="Project CB could not load this flow right now."
            title="Unable to load flow"
          />
        ) : (
          <FlowMetadataForm
            activeOrganizationId={activeOrganization?.id ?? null}
            flow={flowQuery.data.flow}
            key={flowQuery.data.flow.id}
          />
        )}
      </div>
    </main>
  );
};

export default FlowDetails;
