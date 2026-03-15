import type { ComparisonStatement } from "@packages/shared/db/schemas/conditionStatement";
import type { UpdateBuilderInput } from "@packages/shared/http/schemas/flows/builder/updateBuilder";
import { ComparisonOperation, NodeType } from "@packages/shared/types/enums";
import type { XYPosition } from "@xyflow/react";

import type {
  BuilderCanvasGraph,
  BuilderDecisionNode,
  BuilderFlowEdge,
  BuilderFlowNode,
  BuilderStepNode,
} from "./builderFlowToReactFlow";
import {
  createDecisionEdge,
  createDecisionNode,
  createDefaultEdge,
  createFallbackEdge,
  createStepNode,
  isBuilderDecisionNode,
  isBuilderStepNode,
  isDecisionEdge,
  isDefaultEdge,
  isFallbackEdge,
} from "./builderFlowToReactFlow";
import {
  canvasGraphToBuilderFlow,
  type DerivedBuilderFlow,
} from "./canvasGraphToBuilderFlow";

export type BuilderNodeKind = BuilderFlowNode["type"];

export type BuilderTargetOption = {
  id: string;
  label: string;
  type: BuilderFlowNode["type"];
};

const syncGraph = (graph: BuilderCanvasGraph): BuilderCanvasGraph => graph;

const getNodesByType = (flow: DerivedBuilderFlow) =>
  flow.nodes.reduce<{
    decisionNodes: Array<
      Extract<DerivedBuilderFlow["nodes"][number], { type: NodeType.DECISION }>
    >;
    stepNodes: Array<
      Extract<DerivedBuilderFlow["nodes"][number], { type: NodeType.STEP }>
    >;
  }>(
    (acc, node) => {
      if (node.type === NodeType.STEP) {
        acc.stepNodes.push(node);
      } else {
        acc.decisionNodes.push(node);
      }

      return acc;
    },
    {
      decisionNodes: [],
      stepNodes: [],
    },
  );

export const getTargetOptions = (
  nodes: BuilderFlowNode[],
  excludeNodeId?: string,
): BuilderTargetOption[] => {
  return nodes
    .filter((node) => node.id !== excludeNodeId)
    .map((node) => ({
      id: node.id,
      label: `${node.data.name} (${node.type === "step" ? "Step" : "Decision"})`,
      type: node.type,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
};

export const graphToUpdateBuilderInput = (
  graph: BuilderCanvasGraph,
): UpdateBuilderInput => {
  const flow = canvasGraphToBuilderFlow(graph);
  const { decisionNodes, stepNodes } = getNodesByType(flow);

  return {
    decisionNodes: decisionNodes.map((node) => ({
      conditions: node.conditions.map((condition) => ({
        id: condition.id,
        statement: condition.statement,
        toNodeId: condition.toNodeId,
      })),
      coordinates: node.coordinates,
      fallbackNextNodeId: node.fallbackNextNodeId,
      name: node.name,
      nodeId: node.nodeId,
    })),
    stepNodes: stepNodes.map((node) => ({
      coordinates: node.coordinates,
      name: node.name,
      nextNodeId: node.nextNodeId,
      nodeId: node.nodeId,
    })),
  };
};

export const isGraphDirty = (
  graph: BuilderCanvasGraph,
  baselineGraph: BuilderCanvasGraph | null,
) => {
  if (!baselineGraph) {
    return false;
  }

  return (
    JSON.stringify(graphToUpdateBuilderInput(graph)) !==
    JSON.stringify(graphToUpdateBuilderInput(baselineGraph))
  );
};
const DEFAULT_DECISION_RULE_STATEMENT: ComparisonStatement = {
  leftValue: "",
  operator: ComparisonOperation.EQ,
  rightValue: "",
  type: "comparison",
};

const getNode = (graph: BuilderCanvasGraph, nodeId: string) =>
  graph.nodes.find((node) => node.id === nodeId) ?? null;

const buildDecisionRuleEdges = (
  decisionNodeId: string,
  rules: BuilderDecisionNode["data"]["rules"],
) => {
  return rules.flatMap((rule, index) =>
    rule.targetNodeId
      ? [
          createDecisionEdge({
            conditionId: rule.conditionId,
            conditionOrder: index,
            sourceNodeId: decisionNodeId,
            statement: rule.statement,
            targetNodeId: rule.targetNodeId,
          }),
        ]
      : [],
  );
};

const updateDecisionNodeRules = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  getNextRules: (
    rules: BuilderDecisionNode["data"]["rules"],
  ) => BuilderDecisionNode["data"]["rules"],
) => {
  const decisionNode = getNode(graph, decisionNodeId);

  if (!decisionNode || !isBuilderDecisionNode(decisionNode)) {
    return graph;
  }

  const nextRules = getNextRules(decisionNode.data.rules);
  const nextNodes = graph.nodes.map((node) => {
    if (node.id !== decisionNodeId || !isBuilderDecisionNode(node)) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        rules: nextRules,
      },
    };
  });

  return syncGraph({
    edges: [
      ...graph.edges.filter(
        (edge) => !(edge.source === decisionNodeId && isDecisionEdge(edge)),
      ),
      ...buildDecisionRuleEdges(decisionNodeId, nextRules),
    ],
    nodes: nextNodes,
  });
};

export const isEditableLiteralComparisonStatement = (
  statement: ComparisonStatement,
) => {
  return (
    statement.type === "comparison" &&
    (typeof statement.leftValue === "string" ||
      typeof statement.leftValue === "number") &&
    (typeof statement.rightValue === "string" ||
      typeof statement.rightValue === "number")
  );
};

export const addDecisionRuleToGraph = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
) => {
  const decisionNode = getNode(graph, decisionNodeId);

  if (!decisionNode || !isBuilderDecisionNode(decisionNode)) {
    return graph;
  }

  return updateDecisionNodeRules(graph, decisionNodeId, (rules) => [
    ...rules,
    {
      conditionId: crypto.randomUUID(),
      statement: DEFAULT_DECISION_RULE_STATEMENT,
      targetNodeId: null,
    },
  ]);
};

export const updateDecisionRuleInGraph = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  conditionId: string,
  updates: {
    statement?: ComparisonStatement;
    toNodeId?: string | null;
  },
) => {
  return updateDecisionNodeRules(graph, decisionNodeId, (rules) =>
    rules.map((rule) => {
      if (rule.conditionId !== conditionId) {
        return rule;
      }

      return {
        ...rule,
        statement: updates.statement ?? rule.statement,
        targetNodeId:
          "toNodeId" in updates
            ? (updates.toNodeId ?? null)
            : rule.targetNodeId,
      };
    }),
  );
};

export const removeDecisionRuleFromGraph = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  conditionId: string,
) => {
  return updateDecisionNodeRules(graph, decisionNodeId, (rules) =>
    rules.filter((rule) => rule.conditionId !== conditionId),
  );
};

export const moveDecisionRuleInGraph = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  conditionId: string,
  direction: "down" | "up",
) => {
  const decisionNode = getNode(graph, decisionNodeId);

  if (!decisionNode || !isBuilderDecisionNode(decisionNode)) {
    return graph;
  }

  const currentRules = [...decisionNode.data.rules];
  const currentIndex = currentRules.findIndex(
    (rule) => rule.conditionId === conditionId,
  );

  if (currentIndex === -1) {
    return graph;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= currentRules.length) {
    return graph;
  }

  const reorderedRules = [...currentRules];
  const [movedRule] = reorderedRules.splice(currentIndex, 1);
  reorderedRules.splice(targetIndex, 0, movedRule);

  return updateDecisionNodeRules(graph, decisionNodeId, () => reorderedRules);
};

const getDisconnectedStepErrors = (flow: DerivedBuilderFlow) => {
  const entryNodes = new Set(flow.nodes.map((node) => node.nodeId));

  flow.nodes.forEach((node) => {
    if (node.type === NodeType.STEP && node.nextNodeId) {
      entryNodes.delete(node.nextNodeId);
    }

    if (node.type === NodeType.DECISION) {
      if (node.fallbackNextNodeId) {
        entryNodes.delete(node.fallbackNextNodeId);
      }

      for (const condition of node.conditions) {
        entryNodes.delete(condition.toNodeId);
      }
    }
  });

  return entryNodes.size > 1
    ? ["Builder graph must have a single entry node."]
    : [];
};

const getCycleErrors = (flow: DerivedBuilderFlow) => {
  const visitingNodeIds = new Set<string>();
  const visitedNodeIds = new Set<string>();
  const nodesById = new Map(flow.nodes.map((node) => [node.nodeId, node]));

  const getAdjacentNodeIds = (nodeId: string) => {
    const node = nodesById.get(nodeId);

    if (!node) {
      return [];
    }

    if (node.type === NodeType.STEP) {
      return node.nextNodeId ? [node.nextNodeId] : [];
    }

    return [
      node.fallbackNextNodeId,
      ...node.conditions.map((condition) => condition.toNodeId),
    ].filter(Boolean);
  };

  const visit = (nodeId: string): string[] => {
    if (visitingNodeIds.has(nodeId)) {
      return [`Builder graph contains a cycle involving node ${nodeId}.`];
    }

    if (visitedNodeIds.has(nodeId)) {
      return [];
    }

    visitingNodeIds.add(nodeId);

    for (const adjacentNodeId of getAdjacentNodeIds(nodeId)) {
      const nestedErrors = visit(adjacentNodeId);

      if (nestedErrors.length > 0) {
        return nestedErrors;
      }
    }

    visitingNodeIds.delete(nodeId);
    visitedNodeIds.add(nodeId);

    return [];
  };

  for (const nodeId of flow.nodes.map((node) => node.nodeId)) {
    const errors = visit(nodeId);

    if (errors.length > 0) {
      return errors;
    }
  }

  return [];
};

export const getBuilderValidationErrors = (
  graph: BuilderCanvasGraph | null,
) => {
  if (!graph) {
    return [];
  }

  const flow = canvasGraphToBuilderFlow(graph);
  const { decisionNodes, stepNodes } = getNodesByType(flow);
  const submittedStepNodeIds = new Set<string>();
  const submittedDecisionNodeIds = new Set<string>();
  const submittedConditionIds = new Set<string>();
  const submittedNodeIds = new Set<string>();
  const errors: string[] = [];

  for (const step of stepNodes) {
    const trimmedName = step.name.trim();

    if (!trimmedName) {
      errors.push(`Step "${step.nodeId}" needs a name.`);
    }

    if (submittedStepNodeIds.has(step.nodeId)) {
      errors.push(`Step node id "${step.nodeId}" is duplicated.`);
    }

    submittedStepNodeIds.add(step.nodeId);
    submittedNodeIds.add(step.nodeId);
  }

  for (const decisionNode of decisionNodes) {
    const trimmedName = decisionNode.name.trim();

    if (!trimmedName) {
      errors.push(`Decision "${decisionNode.nodeId}" needs a name.`);
    }

    if (submittedDecisionNodeIds.has(decisionNode.nodeId)) {
      errors.push(`Decision node id "${decisionNode.nodeId}" is duplicated.`);
    }

    if (submittedStepNodeIds.has(decisionNode.nodeId)) {
      errors.push(
        `Node id "${decisionNode.nodeId}" cannot be both a step and a decision node.`,
      );
    }

    submittedDecisionNodeIds.add(decisionNode.nodeId);
    submittedNodeIds.add(decisionNode.nodeId);

    for (const condition of decisionNode.conditions) {
      if (submittedConditionIds.has(condition.id)) {
        errors.push(`Decision condition id "${condition.id}" is duplicated.`);
      }

      submittedConditionIds.add(condition.id);
    }
  }

  for (const step of stepNodes) {
    if (step.nextNodeId !== null && !submittedNodeIds.has(step.nextNodeId)) {
      errors.push(`Step "${step.name}" points at a missing next node.`);
    }
  }

  for (const decisionNode of decisionNodes) {
    if (!submittedNodeIds.has(decisionNode.fallbackNextNodeId)) {
      errors.push(
        `Decision "${decisionNode.name}" needs a valid fallback target.`,
      );
    }

    for (const condition of decisionNode.conditions) {
      if (!submittedNodeIds.has(condition.toNodeId)) {
        errors.push(
          `Decision "${decisionNode.name}" has a rule pointing at a missing node.`,
        );
      }
    }
  }

  return [
    ...errors,
    ...getDisconnectedStepErrors(flow),
    ...getCycleErrors(flow),
  ];
};

const getStepConnectionEdges = (
  edges: BuilderFlowEdge[],
  sourceNodeId: string,
  targetNode: BuilderFlowNode,
) => {
  return edges.filter((edge) => {
    if (!isDefaultEdge(edge)) {
      return true;
    }

    if (edge.source === sourceNodeId) {
      return false;
    }

    if (isBuilderStepNode(targetNode) && edge.target === targetNode.id) {
      return false;
    }

    return true;
  });
};

export const addNodeToGraph = (
  graph: BuilderCanvasGraph,
  nodeData: {
    kind: BuilderNodeKind;
    position: XYPosition;
    droppedByNodeId?: string;
  },
) => {
  const node =
    nodeData.kind === "step"
      ? createStepNode(nodeData.position)
      : createDecisionNode(nodeData.position);

  if (nodeData.droppedByNodeId) {
    // TODO: set next node id of previous node
    // TODO: add new edge
  }

  return {
    graph: syncGraph({
      edges: graph.edges,
      nodes: graph.nodes.concat(node),
    }),
    nodeId: node.id,
    ok: true as const,
  };
};

const getRemainingGraphAfterDelete = (
  graph: BuilderCanvasGraph,
  nodeId: string,
): BuilderCanvasGraph => ({
  edges: graph.edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId,
  ),
  nodes: graph.nodes.filter((node) => node.id !== nodeId),
});

export const removeNodeFromGraph = (
  graph: BuilderCanvasGraph,
  nodeId: string,
) => {
  return {
    graph: syncGraph(getRemainingGraphAfterDelete(graph, nodeId)),
    ok: true as const,
  };
};

export const setStepConnection = (
  graph: BuilderCanvasGraph,
  sourceNodeId: string,
  targetNodeId: string | null,
) => {
  const sourceNode = getNode(graph, sourceNodeId);

  if (!sourceNode || !isBuilderStepNode(sourceNode)) {
    return graph;
  }

  if (!targetNodeId) {
    return syncGraph({
      edges: graph.edges.filter(
        (edge) =>
          !(edge.source === sourceNodeId && edge.data.kind === "default"),
      ),
      nodes: graph.nodes,
    });
  }

  if (sourceNodeId === targetNodeId) {
    return graph;
  }

  const targetNode = getNode(graph, targetNodeId);

  if (!targetNode) {
    return graph;
  }

  return syncGraph({
    edges: [
      ...getStepConnectionEdges(graph.edges, sourceNodeId, targetNode),
      createDefaultEdge(sourceNodeId, targetNodeId),
    ],
    nodes: graph.nodes,
  });
};

export const setDecisionFallbackConnection = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  targetNodeId: string | null,
) => {
  const decisionNode = getNode(graph, decisionNodeId);

  if (!decisionNode || !isBuilderDecisionNode(decisionNode)) {
    return graph;
  }

  if (targetNodeId !== null) {
    const targetNode = getNode(graph, targetNodeId);

    if (!targetNode || targetNodeId === decisionNodeId) {
      return graph;
    }
  }

  return syncGraph({
    edges: [
      ...graph.edges.filter(
        (edge) => !(edge.source === decisionNodeId && isFallbackEdge(edge)),
      ),
      ...(targetNodeId
        ? [createFallbackEdge(decisionNodeId, targetNodeId)]
        : []),
    ],
    nodes: graph.nodes,
  });
};

export const setDecisionRuleConnection = (
  graph: BuilderCanvasGraph,
  decisionNodeId: string,
  conditionId: string,
  targetNodeId: string | null,
) => {
  const decisionNode = getNode(graph, decisionNodeId);

  if (!decisionNode || !isBuilderDecisionNode(decisionNode)) {
    return graph;
  }

  if (targetNodeId !== null) {
    const targetNode = graph.nodes.find((node) => node.id === targetNodeId);

    if (!targetNode || decisionNodeId === targetNodeId) {
      return graph;
    }
  }

  return updateDecisionNodeRules(graph, decisionNodeId, (rules) =>
    rules.map((rule) => {
      if (rule.conditionId !== conditionId) {
        return rule;
      }

      return {
        ...rule,
        targetNodeId,
      };
    }),
  );
};

export const removeEditableEdgeFromGraph = (
  graph: BuilderCanvasGraph,
  edgeId: string,
) => {
  const edge = graph.edges.find((candidate) => candidate.id === edgeId);

  if (!edge) {
    return graph;
  }

  if (isDefaultEdge(edge)) {
    return syncGraph({
      edges: graph.edges.filter((candidate) => candidate.id !== edgeId),
      nodes: graph.nodes,
    });
  }

  if (isDecisionEdge(edge)) {
    return setDecisionRuleConnection(
      graph,
      edge.source,
      edge.data.conditionId,
      null,
    );
  }

  if (isFallbackEdge(edge)) {
    return setDecisionFallbackConnection(graph, edge.source, null);
  }

  return graph;
};

export const updateNodeInGraph = (
  graph: BuilderCanvasGraph,
  nodeId: string,
  updates:
    | (Partial<Pick<BuilderStepNode["data"], "name">> & {
        nextNodeId?: string | null;
      })
    | (Partial<Pick<BuilderDecisionNode["data"], "name">> & {
        fallbackNextNodeId?: string | null;
      }),
) => {
  const targetNode = getNode(graph, nodeId);

  if (!targetNode) {
    return graph;
  }

  if (isBuilderStepNode(targetNode)) {
    const nextNodes = graph.nodes.map((node) => {
      if (node.id !== nodeId || !isBuilderStepNode(node)) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          name:
            "name" in updates && typeof updates.name === "string"
              ? updates.name
              : node.data.name,
        },
      };
    });

    const renamedGraph = syncGraph({
      edges: graph.edges,
      nodes: nextNodes,
    });

    if (!("nextNodeId" in updates)) {
      return renamedGraph;
    }

    return setStepConnection(renamedGraph, nodeId, updates.nextNodeId ?? null);
  }

  const nextNodes = graph.nodes.map((node) => {
    if (node.id !== nodeId || !isBuilderDecisionNode(node)) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        name:
          "name" in updates && typeof updates.name === "string"
            ? updates.name
            : node.data.name,
      },
    };
  });

  const renamedGraph = syncGraph({
    edges: graph.edges,
    nodes: nextNodes,
  });

  if (!("fallbackNextNodeId" in updates)) {
    return renamedGraph;
  }

  return setDecisionFallbackConnection(
    renamedGraph,
    nodeId,
    updates.fallbackNextNodeId ?? null,
  );
};

export const sanitizeSelectionAfterGraphReplace = (
  graph: BuilderCanvasGraph,
  selection: { id: string; kind: "edge" | "node" } | null,
) => {
  if (!selection) {
    return null;
  }

  if (selection.kind === "node") {
    return graph.nodes.some((node) => node.id === selection.id)
      ? selection
      : null;
  }

  return graph.edges.some((edge) => edge.id === selection.id)
    ? selection
    : null;
};
