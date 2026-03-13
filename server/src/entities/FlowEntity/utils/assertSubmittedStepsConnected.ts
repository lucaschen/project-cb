import type {
  BuilderDecisionNodeInputType,
  BuilderStepInputType,
} from "@packages/shared/http/schemas/flows/builder/common";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

/**
 * Preserve the existing BE03 rule that the first submitted step is the implied
 * entrypoint and every later step must be reachable from another submitted
 * step or a submitted decision node.
 */
export default function assertSubmittedStepsConnected({
  decisionNodes,
  steps,
}: {
  decisionNodes: BuilderDecisionNodeInputType[];
  steps: BuilderStepInputType[];
}): void {
  const submittedStepNodeIds = steps.map((step) => step.nodeId);
  const submittedStepNodeIdSet = new Set(submittedStepNodeIds);
  const inboundReferenceCounts = new Map(
    submittedStepNodeIds.map((nodeId) => [nodeId, 0]),
  );

  for (const step of steps) {
    if (
      step.nextNodeId !== null &&
      submittedStepNodeIdSet.has(step.nextNodeId) &&
      step.nextNodeId !== step.nodeId
    ) {
      inboundReferenceCounts.set(
        step.nextNodeId,
        (inboundReferenceCounts.get(step.nextNodeId) ?? 0) + 1,
      );
    }
  }

  for (const decisionNode of decisionNodes) {
    if (submittedStepNodeIdSet.has(decisionNode.fallbackNextNodeId)) {
      inboundReferenceCounts.set(
        decisionNode.fallbackNextNodeId,
        (inboundReferenceCounts.get(decisionNode.fallbackNextNodeId) ?? 0) + 1,
      );
    }

    for (const condition of decisionNode.conditions) {
      if (!submittedStepNodeIdSet.has(condition.toNodeId)) {
        continue;
      }

      inboundReferenceCounts.set(
        condition.toNodeId,
        (inboundReferenceCounts.get(condition.toNodeId) ?? 0) + 1,
      );
    }
  }

  for (const [index, step] of steps.entries()) {
    if (index === 0) {
      continue;
    }

    if ((inboundReferenceCounts.get(step.nodeId) ?? 0) === 0) {
      throw new InvalidRequestError(
        `Step node id: ${step.nodeId} is disconnected from the submitted builder graph.`,
      );
    }
  }
}
