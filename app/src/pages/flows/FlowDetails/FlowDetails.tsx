import "@xyflow/react/dist/style.css";

import { getFlow } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { EmptyState } from "@app/components/ui/EmptyState";
import { PageMessage } from "@app/components/ui/PageMessage";
import useRootContext from "@app/hooks/useRootContext";
import { useQuery } from "@tanstack/react-query";
import type { NodeTypes } from "@xyflow/react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { path as flowsListPath } from "../FlowsList";
import useBuilderStore from "./builderStore";
import DecisionFlowNode from "./DecisionFlowNode";
import FlowMetadataForm from "./FlowMetadataForm";
import FlowStructureList from "./FlowStructureList";
import { flowToReactFlow } from "./flowToReactFlow";
import StepFlowNode from "./StepFlowNode";

const nodeTypes: NodeTypes = {
  decision: DecisionFlowNode,
  step: StepFlowNode,
};

const paletteItems = [
  {
    description:
      "Drag into the canvas to create a new step node once FE 07 lands.",
    title: "Step",
  },
  {
    description:
      "Decision nodes become real graph-spawning interactions in FE 07.",
    title: "Decision",
  },
];

const FlowDetails = () => {
  const { activeOrganization, sessionData } = useRootContext();
  const { flowId } = useParams<{ flowId: string }>();
  const clearSelection = useBuilderStore((state) => state.clearSelection);
  const inspectorTab = useBuilderStore((state) => state.inspectorTab);
  const isInspectorOpen = useBuilderStore((state) => state.isInspectorOpen);
  const isPaletteOpen = useBuilderStore((state) => state.isPaletteOpen);
  const resetBuilder = useBuilderStore((state) => state.reset);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const setInspectorTab = useBuilderStore((state) => state.setInspectorTab);
  const toggleInspectorOpen = useBuilderStore(
    (state) => state.toggleInspectorOpen,
  );
  const togglePaletteOpen = useBuilderStore((state) => state.togglePaletteOpen);

  useEffect(() => {
    resetBuilder();
  }, [flowId, resetBuilder]);

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

  const flow = flowQuery.data?.flow;
  const selectedNode = flow?.nodes.find(
    (node) => node.nodeId === selectedNodeId,
  );

  const { edges, nodes } = flow
    ? flowToReactFlow(flow)
    : { edges: [], nodes: [] };

  const builderNodes = nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }));

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="shrink-0 flex flex-wrap gap-2 lg:hidden">
        <Button
          className="px-3 py-2 text-sm"
          onClick={togglePaletteOpen}
          variant="secondary"
        >
          {isPaletteOpen ? "Hide palette" : "Show palette"}
        </Button>
        <Button
          className="px-3 py-2 text-sm"
          onClick={toggleInspectorOpen}
          variant="secondary"
        >
          {isInspectorOpen ? "Hide inspector" : "Show inspector"}
        </Button>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[216px_minmax(0,1fr)_292px]">
        <aside className={`min-h-0 ${isPaletteOpen ? "block" : "hidden"} lg:block`}>
          <Card className="rounded-[22px] p-4 lg:h-full">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Palette
              </p>
              <p className="text-sm text-slate-400">
                FE 07 wires these tiles into graph creation.
              </p>
            </div>
            <div className="mt-4 space-y-2.5">
              {paletteItems.map((item) => (
                <div
                  className="rounded-2xl border border-dashed border-sky-300/30 bg-sky-300/5 px-3 py-3"
                  key={item.title}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Soon
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <section className="min-w-0 min-h-0">
          {flowQuery.isPending ? (
            <Card className="h-full min-h-0 rounded-[22px] p-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">
                  Loading builder shell
                </h2>
                <p className="text-sm leading-6 text-slate-300">
                  Fetching the latest nodes and graph structure for this flow.
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
              description="Project CB could not load this flow builder right now."
              title="Unable to load builder"
            />
          ) : (
            <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {flow?.name}
                  </p>
                  <p className="text-xs text-slate-400">Slug: {flow?.slug}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                  Read-only shell for FE 06
                </div>
              </div>
              <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]">
                <ReactFlowProvider>
                  <ReactFlow
                    edges={edges}
                    fitView
                    nodeTypes={nodeTypes}
                    nodes={builderNodes}
                    nodesConnectable={false}
                    nodesDraggable={false}
                    onNodeClick={(_, node) => {
                      selectNode(node.id);
                    }}
                    onPaneClick={() => {
                      clearSelection();
                    }}
                  >
                    <Background color="rgba(148, 163, 184, 0.22)" gap={24} />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </Card>
          )}
        </section>

        <aside className={`min-h-0 ${isInspectorOpen ? "block" : "hidden"} lg:block`}>
          <div className="space-y-3 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-y-auto">
            <div className="flex gap-2">
              <Button
                className="flex-1 px-3 py-2 text-sm"
                onClick={() => setInspectorTab("flow")}
                variant={inspectorTab === "flow" ? "primary" : "secondary"}
              >
                Flow
              </Button>
              <Button
                className="flex-1 px-3 py-2 text-sm"
                onClick={() => setInspectorTab("selection")}
                variant={inspectorTab === "selection" ? "primary" : "secondary"}
              >
                Selection
              </Button>
            </div>

            {flow && inspectorTab === "flow" ? (
              <>
                <Card className="rounded-[22px] p-4">
                  <FlowMetadataForm
                    activeOrganizationId={activeOrganization?.id ?? null}
                    flow={flow}
                    key={flow.id}
                  />
                </Card>
                <Card className="rounded-[22px] p-4">
                  <FlowStructureList
                    nodes={flow.nodes}
                    onSelectNode={selectNode}
                    selectedNodeId={selectedNodeId}
                  />
                </Card>
              </>
            ) : null}

            {inspectorTab === "selection" ? (
              <Card className="rounded-[22px] p-4">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Selection
                      </p>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedNode.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {selectedNode.type === "STEP"
                          ? "Step node"
                          : "Decision node"}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                      {selectedNode.type === "STEP" ? (
                        <>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-400">Elements</span>
                            <span className="font-medium text-white">
                              {selectedNode.elements.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-400">Next node</span>
                            <span className="truncate font-medium text-white">
                              {selectedNode.nextNodeId ?? "Not connected"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-400">Rules</span>
                            <span className="font-medium text-white">
                              {selectedNode.conditions.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-400">Fallback</span>
                            <span className="truncate font-medium text-white">
                              {selectedNode.fallbackNextNodeId}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-sm leading-5 text-slate-400">
                      FE 08 will replace this with the editable node properties
                      sidebar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Selection
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      No node selected
                    </h3>
                    <p className="text-sm leading-5 text-slate-400">
                      Choose a node from the canvas or structure list.
                    </p>
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default FlowDetails;
