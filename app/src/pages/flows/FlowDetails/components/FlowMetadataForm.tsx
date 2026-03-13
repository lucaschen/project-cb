import { updateFlowMetadata } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import { TextAreaField } from "@app/components/ui/TextAreaField";
import { trimAndNullOnEmpty } from "@app/utils/string";
import type {
  FlowType,
  FlowWithNodesType,
} from "@packages/shared/http/schemas/flows/common";
import type { FetchFlowOutput } from "@packages/shared/http/schemas/flows/fetchFlow";
import type { UpdateFlowMetadataInput } from "@packages/shared/http/schemas/flows/updateFlowMetadata";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";

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
  const [flowDescription, setFlowDescription] = useState(flow.description ?? "");
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
          (existingFlows: FlowType[] | undefined) =>
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
    <form className="space-y-4" onSubmit={handleSave}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Metadata</h3>
        <p className="text-sm text-slate-400">
          Top-level flow details for the workspace.
        </p>
      </div>
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
      {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}
      {saveMessage ? <p className="text-sm text-sky-300">{saveMessage}</p> : null}
      <div className="flex flex-col gap-2">
        <Button
          className="px-3 py-2 text-sm"
          disabled={!isDirty}
          isBusy={updateFlowMetadataMutation.isPending}
          type="submit"
        >
          Save metadata
        </Button>
        <p className="text-sm leading-5 text-slate-500">
          {isDirty
            ? "Unsaved metadata changes are ready to save."
            : "No metadata changes to save."}
        </p>
      </div>
    </form>
  );
};

export default FlowMetadataForm;
