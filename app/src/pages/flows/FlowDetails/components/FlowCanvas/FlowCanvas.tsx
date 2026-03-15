import { Card } from "@app/components/ui/Card";
import type {
  FlowGraphEdge,
  FlowGraphNode,
} from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
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
import {
  isDecisionFallbackEdge,
  isDecisionRuleEdge,
} from "../../utils/builderFlowToReactFlow";
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

const getEdgeColor = (edge: FlowGraphEdge, selected: boolean) => {
  if (isDecisionFallbackEdge(edge)) {
    return selected ? "#fbbf24" : "#f59e0b";
  }

  if (isDecisionRuleEdge(edge)) {
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
  const updateGraph = useBuilderStore((state) => state.updateGraph);
  const selectedItem = useBuilderStore((state) => state.selectedItem);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    FlowGraphNode,
    FlowGraphEdge
  > | null>(null);
  const reconnectSucceededRef = useRef(false);

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
          edge.data.type === "step" ||
          edge.data.type === "fallback" ||
          edge.data.type === "decision",
        selected: selectedItem?.kind === "edge" && selectedItem.id === edge.id,
        selectable: true,
        type: "builder",
      })),
    [edges, selectedItem],
  );

  const createNodeAtPosition = useCallback(
    (type: "decision" | "step", position: { x: number; y: number }) => {
      updateGraph((graph) => {
        const createdNode = graph.addNode({
          position,
          type,
        });

        if (!createdNode) return;

        selectItem({
          id: createdNode.id,
          kind: "node",
        });
      });
    },
    [updateGraph, selectItem],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      if (connection.source === connection.target) {
        return;
      }

      updateGraph((graph) => {
        graph.setConnection({
          sourceHandle: connection.sourceHandle ?? undefined,
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
        });
      });
    },
    [updateGraph],
  );

  const handleEdgesDelete = useCallback(
    (edgesToDelete: FlowGraphEdge[]) => {
      updateGraph((graph) => {
        for (const edge of edgesToDelete) {
          graph.removeEdgeById(edge.id);
        }
      });
    },
    [updateGraph],
  );

  const handleNodesDelete = useCallback(
    (nodesToDelete: FlowGraphNode[]) => {
      updateGraph((graph) => {
        for (const node of nodesToDelete) {
          graph.removeNodeById(node.id);
        }
      });
    },
    [updateGraph],
  );

  const handleReconnect = useCallback(
    (oldEdge: FlowGraphEdge, connection: Connection) => {
      if (!connection.target) {
        return;
      }

      const sourceNodeId = connection.source ?? oldEdge.source;

      if (!sourceNodeId || sourceNodeId === connection.target) {
        return;
      }

      reconnectSucceededRef.current = true;
      updateGraph((graph) => {
        graph.setConnection({
          sourceHandle:
            connection.sourceHandle ?? oldEdge.sourceHandle ?? undefined,
          sourceNodeId,
          targetNodeId: connection.target,
        });
      });
    },
    [updateGraph],
  );

  const handleReconnectStart = useCallback(() => {
    reconnectSucceededRef.current = false;
  }, []);

  const handleReconnectEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent,
      edge: FlowGraphEdge,
      _handleType: HandleType,
      connectionState: FinalConnectionState,
    ) => {
      if (reconnectSucceededRef.current) {
        return;
      }

      if (connectionState.toNode !== null) {
        return;
      }

      updateGraph((graph) => {
        graph.removeEdgeById(edge.id);
      });
    },
    [updateGraph],
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
            onNodesChange={applyNodeChanges}
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
