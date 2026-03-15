import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { useToast } from "@app/components/ui/ToastProvider";
import type { FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import { useMemo, useState } from "react";

import useUpdateFlow from "../../hooks/useUpdateFlow";
import useBuilderStore from "../../store/builderStore";
import { flowToReactFlow } from "../../utils/builderFlowToReactFlow";
import {
  addDecisionRuleToGraph,
  moveDecisionRuleInGraph,
  removeDecisionRuleFromGraph,
  removeEditableEdgeFromGraph,
  removeNodeFromGraph,
  updateDecisionRuleInGraph,
  updateNodeInGraph,
} from "../../utils/builderGraph";
import BuilderSelectionPanel from "./components/BuilderSelectionPanel";
import FlowMetadataForm from "./components/FlowMetadataForm";

type InspectorTab = "flow" | "selection";

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
  const selectedItem = useBuilderStore((state) => state.selectedItem);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("flow");

  const { updateFlow, isPending: isUpdatePending } = useUpdateFlow(flow.id);

  const currentGraph = useMemo(
    () => ({
      edges,
      nodes,
    }),
    [edges, nodes],
  );

  const selectedNode =
    selectedItem?.kind === "node"
      ? (nodes.find((node) => node.id === selectedItem.id) ?? null)
      : null;
  const selectedEdge =
    selectedItem?.kind === "edge"
      ? (edges.find((edge) => edge.id === selectedItem.id) ?? null)
      : null;

  const handleUpdateNode = (
    nodeId: string,
    updates: Parameters<typeof updateNodeInGraph>[2],
  ) => {
    initializeGraph(updateNodeInGraph(currentGraph, nodeId, updates), {
      preserveSelection: true,
    });
  };

  const handleDeleteSelectedNode = (nodeId: string) => {
    const result = removeNodeFromGraph(currentGraph, nodeId);

    if (!result.ok) {
      return;
    }

    initializeGraph(result.graph, { preserveSelection: true });
  };

  const handleDeleteSelectedEdge = (edgeId: string) => {
    initializeGraph(removeEditableEdgeFromGraph(currentGraph, edgeId), {
      preserveSelection: true,
    });
  };

  const handleAddDecisionRule = (nodeId: string) => {
    initializeGraph(addDecisionRuleToGraph(currentGraph, nodeId), {
      preserveSelection: true,
    });
  };

  const handleUpdateDecisionRule = (
    nodeId: string,
    conditionId: string,
    updates: Parameters<typeof updateDecisionRuleInGraph>[3],
  ) => {
    initializeGraph(updateDecisionRuleInGraph(currentGraph, nodeId, conditionId, updates), {
      preserveSelection: true,
    });
  };

  const handleMoveDecisionRule = (
    nodeId: string,
    conditionId: string,
    direction: "down" | "up",
  ) => {
    initializeGraph(moveDecisionRuleInGraph(currentGraph, nodeId, conditionId, direction), {
      preserveSelection: true,
    });
  };

  const handleDeleteDecisionRule = (nodeId: string, conditionId: string) => {
    initializeGraph(removeDecisionRuleFromGraph(currentGraph, nodeId, conditionId), {
      preserveSelection: true,
    });
  };

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
      <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 rounded-[18px] border border-white/10 bg-slate-950/70 p-1">
          <Button
            className="h-10 px-3 text-sm"
            onClick={() => setInspectorTab("flow")}
            variant={inspectorTab === "flow" ? "primary" : "secondary"}
          >
            Flow
          </Button>
          <Button
            className="h-10 px-3 text-sm"
            onClick={() => setInspectorTab("selection")}
            variant={inspectorTab === "selection" ? "primary" : "secondary"}
          >
            Selection
          </Button>
        </div>

        {inspectorTab === "flow" ? (
          <>
            <Card className="rounded-[22px] p-3">
              <FlowMetadataForm
                activeOrganizationId={activeOrganizationId}
                flow={flow}
                key={flow.id}
              />
            </Card>
            <Card className="rounded-[22px] p-3">
              <div className="space-y-4">
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
                <div className="flex flex-col gap-2">
                  <Button
                    className="h-10 px-3 text-sm"
                    disabled={!isDirty || isUpdatePending}
                    isBusy={isUpdatePending}
                    onClick={() => void handleSave()}
                  >
                    Save
                  </Button>
                  <Button
                    className="h-10 px-3 text-sm"
                    disabled={!isDirty || isUpdatePending}
                    onClick={handleDiscard}
                    variant="secondary"
                  >
                    Discard
                  </Button>
                  <p className="text-sm leading-5 text-slate-500">
                    {isDirty
                      ? "Unsaved builder changes are ready to save."
                      : "Builder matches the last saved state."}
                  </p>
                </div>
              </div>
            </Card>
          </>
        ) : null}

        {inspectorTab === "selection" ? (
          <Card className="rounded-[22px] p-3">
            <BuilderSelectionPanel
              onAddDecisionRule={handleAddDecisionRule}
              onDeleteDecisionRule={handleDeleteDecisionRule}
              edge={selectedEdge}
              edges={edges}
              onMoveDecisionRule={handleMoveDecisionRule}
              node={selectedNode}
              nodes={nodes}
              onDeleteEdge={handleDeleteSelectedEdge}
              onDeleteNode={handleDeleteSelectedNode}
              onSelectNode={(nodeId) =>
                selectItem({
                  id: nodeId,
                  kind: "node",
                })
              }
              onUpdateDecisionRule={handleUpdateDecisionRule}
              onUpdateNode={handleUpdateNode}
            />
          </Card>
        ) : null}
      </div>
    </aside>
  );
};

export default BuilderSidebar;
