import { Card } from "@app/components/ui/Card";
import type {
  Connection,
  EdgeTypes,
  FinalConnectionState,
  HandleType,
  NodeTypes,
  ReactFlowInstance,
} from "@xyflow/react";
import { Background, Controls, MarkerType, ReactFlow } from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";

import useBuilderStore from "../../store/builderStore";
import type {
  BuilderFlowEdge,
  BuilderFlowNode,
} from "../../utils/builderFlowToReactFlow";
import {
  getDecisionConditionIdFromSourceHandle,
  isBuilderDecisionNode,
  isBuilderStepNode,
  isDecisionEdge,
  isDecisionFallbackSourceHandle,
  isDefaultEdge,
  isFallbackEdge,
} from "../../utils/builderFlowToReactFlow";
import {
  addNodeToGraph,
  removeEditableEdgeFromGraph,
  removeNodeFromGraph,
  setDecisionFallbackConnection,
  setDecisionRuleConnection,
  setStepConnection,
} from "../../utils/builderGraph";
import { BUILDER_NODE_KIND } from "../BuilderPalette/BuilderPalette";
import BuilderFlowEdgeRenderer from "./components/BuilderFlowEdge";
import DecisionFlowNode from "./components/DecisionFlowNode";
import StepFlowNode from "./components/StepFlowNode";

const nodeTypes: NodeTypes = {
  decision: DecisionFlowNode,
  step: StepFlowNode,
};

const edgeTypes: EdgeTypes = {
  builder: BuilderFlowEdgeRenderer,
};

const DECISION_RULE_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#84cc16"];

const getEdgeColor = (edge: BuilderFlowEdge, selected: boolean) => {
  if (isFallbackEdge(edge)) {
    return selected ? "#fbbf24" : "#f59e0b";
  }

  if (isDecisionEdge(edge)) {
    return selected
      ? "#ffffff"
      : DECISION_RULE_COLORS[
          edge.data.conditionOrder % DECISION_RULE_COLORS.length
        ];
  }

  return selected ? "#7dd3fc" : "#38bdf8";
};

type FlowCanvasProps = {
  flowName: string;
  flowSlug: string;
  isDirty: boolean;
};

const FlowCanvas = ({ flowName, flowSlug, isDirty }: FlowCanvasProps) => {
  const applyNodeChanges = useBuilderStore((state) => state.applyNodeChanges);
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);
  const initializeGraph = useBuilderStore((state) => state.initializeGraph);
  const selectedItem = useBuilderStore((state) => state.selectedItem);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    BuilderFlowNode,
    BuilderFlowEdge
  > | null>(null);
  const reconnectSucceededRef = useRef(false);

  const currentGraph = useMemo(
    () => ({
      edges,
      nodes,
    }),
    [edges, nodes],
  );

  const builderNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: selectedItem?.kind === "node" && selectedItem.id === node.id,
      })),
    [nodes, selectedItem],
  );

  const builderEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        deletable: true,
        markerEnd: {
          color: getEdgeColor(
            edge,
            selectedItem?.kind === "edge" && selectedItem.id === edge.id,
          ),
          height: 18,
          type: MarkerType.ArrowClosed,
          width: 18,
        },
        reconnectable:
          edge.data.kind === "default" ||
          edge.data.kind === "fallback" ||
          edge.data.kind === "decision",
        selected: selectedItem?.kind === "edge" && selectedItem.id === edge.id,
        selectable: true,
        type: "builder",
      })),
    [edges, selectedItem],
  );

  const createNodeAtPosition = useCallback(
    (kind: "decision" | "step", position: { x: number; y: number }) => {
      const result = addNodeToGraph(currentGraph, { kind, position });

      if (!result.ok) {
        return;
      }

      initializeGraph(result.graph, { preserveSelection: true });
      selectItem({
        id: result.nodeId,
        kind: "node",
      });
    },
    [currentGraph, initializeGraph, selectItem],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      if (connection.source === connection.target) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === connection.source);

      if (!sourceNode) {
        return;
      }

      if (isBuilderStepNode(sourceNode)) {
        initializeGraph(
          setStepConnection(currentGraph, connection.source, connection.target),
          { preserveSelection: true },
        );
      } else if (
        isBuilderDecisionNode(sourceNode) &&
        isDecisionFallbackSourceHandle(connection.sourceHandle)
      ) {
        initializeGraph(
          setDecisionFallbackConnection(
            currentGraph,
            connection.source,
            connection.target,
          ),
          { preserveSelection: true },
        );
      } else if (isBuilderDecisionNode(sourceNode)) {
        const conditionId = getDecisionConditionIdFromSourceHandle(
          connection.sourceHandle,
        );

        if (!conditionId) {
          return;
        }

        initializeGraph(
          setDecisionRuleConnection(
            currentGraph,
            connection.source,
            conditionId,
            connection.target,
          ),
          { preserveSelection: true },
        );
      } else {
        return;
      }

      selectItem({
        id: connection.source,
        kind: "node",
      });
    },
    [currentGraph, nodes, initializeGraph, selectItem],
  );

  const handleEdgesDelete = useCallback(
    (edgesToDelete: BuilderFlowEdge[]) => {
      let nextGraph = currentGraph;

      for (const edge of edgesToDelete) {
        nextGraph = removeEditableEdgeFromGraph(nextGraph, edge.id);
      }

      initializeGraph(nextGraph, { preserveSelection: true });
    },
    [currentGraph, initializeGraph],
  );

  const handleNodesDelete = useCallback(
    (nodesToDelete: BuilderFlowNode[]) => {
      let nextGraph = currentGraph;

      for (const node of nodesToDelete) {
        const result = removeNodeFromGraph(nextGraph, node.id);

        if (!result.ok) {
          continue;
        }

        nextGraph = result.graph;
      }

      initializeGraph(nextGraph, { preserveSelection: true });
    },
    [currentGraph, initializeGraph],
  );

  const handleReconnect = useCallback(
    (oldEdge: BuilderFlowEdge, connection: Connection) => {
      if (!connection.target) {
        return;
      }

      if (isDefaultEdge(oldEdge)) {
        const sourceNodeId = connection.source ?? oldEdge.source;

        if (!sourceNodeId) {
          return;
        }

        reconnectSucceededRef.current = true;
        handleConnect({
          ...connection,
          source: sourceNodeId,
        });
        return;
      }

      if (!isFallbackEdge(oldEdge)) {
        if (!isDecisionEdge(oldEdge)) {
          return;
        }

        const sourceNodeId = connection.source ?? oldEdge.source;
        const conditionId =
          getDecisionConditionIdFromSourceHandle(
            connection.sourceHandle ?? oldEdge.sourceHandle,
          ) ?? oldEdge.data.conditionId;

        if (!sourceNodeId || sourceNodeId === connection.target) {
          return;
        }

        reconnectSucceededRef.current = true;
        initializeGraph(
          setDecisionRuleConnection(
            currentGraph,
            sourceNodeId,
            conditionId,
            connection.target,
          ),
          { preserveSelection: true },
        );
        selectItem({
          id: sourceNodeId,
          kind: "node",
        });
        return;
      }

      const sourceNodeId = connection.source ?? oldEdge.source;

      if (!sourceNodeId || sourceNodeId === connection.target) {
        return;
      }

      reconnectSucceededRef.current = true;
      initializeGraph(
        setDecisionFallbackConnection(
          currentGraph,
          sourceNodeId,
          connection.target,
        ),
        { preserveSelection: true },
      );
      selectItem({
        id: sourceNodeId,
        kind: "node",
      });
    },
    [currentGraph, handleConnect, initializeGraph, selectItem],
  );

  const handleReconnectStart = useCallback(() => {
    reconnectSucceededRef.current = false;
  }, []);

  const handleReconnectEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent,
      edge: BuilderFlowEdge,
      _handleType: HandleType,
      connectionState: FinalConnectionState,
    ) => {
      if (reconnectSucceededRef.current) {
        return;
      }

      if (connectionState.toNode !== null) {
        return;
      }

      initializeGraph(removeEditableEdgeFromGraph(currentGraph, edge.id), {
        preserveSelection: true,
      });
      selectItem(null);
    },
    [currentGraph, initializeGraph, selectItem],
  );

  return (
    <section className="min-h-0 min-w-0 grow">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {flowName}
            </p>
            <p className="text-xs text-slate-400">Slug: {flowSlug}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
            {isDirty ? "Draft changes in progress" : "Builder synced"}
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]">
          <ReactFlow
            deleteKeyCode={["Delete", "Backspace"]}
            edges={builderEdges}
            edgesReconnectable
            edgeTypes={edgeTypes}
            elementsSelectable
            fitView
            nodeTypes={nodeTypes}
            nodes={builderNodes}
            nodesConnectable
            nodesDraggable
            onConnect={handleConnect}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();

              const kind = event.dataTransfer.getData(BUILDER_NODE_KIND);

              if (
                (kind !== "step" && kind !== "decision") ||
                !reactFlowInstance
              ) {
                return;
              }

              createNodeAtPosition(
                kind,
                reactFlowInstance.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                }),
              );
            }}
            onEdgesDelete={handleEdgesDelete}
            onEdgeClick={(_, edge) => {
              selectItem({
                id: edge.id,
                kind: "edge",
              });
            }}
            onInit={setReactFlowInstance}
            onNodeClick={(_, node) => {
              selectItem({
                id: node.id,
                kind: "node",
              });
            }}
            onNodeDoubleClick={(_, node) => {
              selectItem({
                id: node.id,
                kind: "node",
              });
            }}
            onNodeDragStart={(_, node) => {
              selectItem({
                id: node.id,
                kind: "node",
              });
            }}
            onNodesChange={applyNodeChanges}
            onNodesDelete={handleNodesDelete}
            onPaneClick={() => {
              selectItem(null);
            }}
            onReconnect={handleReconnect}
            onReconnectEnd={handleReconnectEnd}
            onReconnectStart={handleReconnectStart}
          >
            <Background color="rgba(148, 163, 184, 0.22)" gap={24} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </Card>
    </section>
  );
};

export default FlowCanvas;
