import { Button } from "@app/components/ui/Button";
import { useToast } from "@app/components/ui/ToastProvider";
import type { FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import { useMemo } from "react";

import useUpdateFlow from "../../hooks/useUpdateFlow";
import useBuilderStore from "../../store/builderStore";
import { flowToReactFlow } from "../../utils/builderFlowToReactFlow";
import BuilderSelectionPanel from "./components/BuilderSelectionPanel";
import FlowMetadataForm from "./components/FlowMetadataForm";

type BuilderSidebarProps = {
  activeOrganizationId: string;
  flow: FlowWithNodesType;
  isDirty: boolean;
  isOpen: boolean;
  validationErrors: string[];
};

const BuilderSidebar = ({
  activeOrganizationId,
  flow,
  isDirty,
  isOpen,
  validationErrors,
}: BuilderSidebarProps) => {
  const toast = useToast();
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);
  const initializeGraph = useBuilderStore((state) => state.initializeGraph);
  const inspectorTab = useBuilderStore((state) => state.inspectorTab);
  const setInspectorTab = useBuilderStore((state) => state.setInspectorTab);

  const { updateFlow, isPending: isUpdatePending } = useUpdateFlow(flow.id);

  const currentGraph = useMemo(
    () => ({
      edges,
      nodes,
    }),
    [edges, nodes],
  );

  const handleDiscard = () => {
    initializeGraph(flowToReactFlow(flow));
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      toast.info("Fix the builder issues before saving.");
      return;
    }

    await updateFlow(currentGraph);
  };

  return (
    <aside className={`h-full min-h-0 w-full ${isOpen ? "block" : "hidden"}`}>
      <div className="flex h-full min-h-0 flex-col overflow-y-auto border-l border-white/8 bg-slate-950/94 px-4 py-5">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          <Button
            className="h-9 px-3 text-sm"
            onClick={() => setInspectorTab("flow")}
            variant={inspectorTab === "flow" ? "primary" : "secondary"}
          >
            Flow
          </Button>
          <Button
            className="h-9 px-3 text-sm"
            onClick={() => setInspectorTab("selection")}
            variant={inspectorTab === "selection" ? "primary" : "secondary"}
          >
            Selection
          </Button>
        </div>

        {inspectorTab === "flow" ? (
          <>
            <div className="mt-4 border-b border-white/8 pb-4">
              <FlowMetadataForm
                activeOrganizationId={activeOrganizationId}
                flow={flow}
                key={flow.id}
              />
            </div>
            <div className="space-y-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Builder
                  </p>
                  <p className="text-sm leading-5 text-slate-400">
                    Save or discard graph changes.
                  </p>
                </div>
                <div
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isDirty
                      ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
                      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                  }`}
                >
                  {isDirty ? "Draft" : "Synced"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="h-9 px-3 text-sm"
                  disabled={!isDirty || isUpdatePending}
                  isBusy={isUpdatePending}
                  onClick={() => void handleSave()}
                >
                  Save
                </Button>
                <Button
                  className="h-9 px-3 text-sm"
                  disabled={!isDirty || isUpdatePending}
                  onClick={handleDiscard}
                  variant="secondary"
                >
                  Discard
                </Button>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {isDirty
                  ? "Unsaved builder changes are ready to save."
                  : "Builder matches the last saved state."}
              </p>
              {validationErrors.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                    Builder issues
                  </p>
                  <ul className="space-y-1 text-sm text-amber-100">
                    {validationErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {inspectorTab === "selection" ? (
          <div className="mt-4 border-t border-white/8 pt-4">
            <BuilderSelectionPanel />
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default BuilderSidebar;
