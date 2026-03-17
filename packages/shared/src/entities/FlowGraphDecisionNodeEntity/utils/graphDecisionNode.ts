import type { ComparisonStatement } from "~shared/db/schemas/conditionStatement";
import type { GraphDecisionRuleEdge } from "~shared/entities/FlowGraphEntity/types/flowGraph";
import { getDecisionRuleSourceHandleId } from "~shared/entities/FlowGraphEntity/utils/graph";
import type { DecisionConditionType } from "~shared/http/schemas/flows/common";

export const formatComparisonOperand = (
  operand: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
) => {
  if (typeof operand === "string") {
    return operand.length > 0 ? `"${operand}"` : '""';
  }

  if (typeof operand === "number") {
    return operand.toString();
  }

  if (operand.type === "randomNumber") {
    return `Random ${operand.min}-${operand.max}`;
  }

  return "Step value";
};

export const formatComparisonStatement = (
  statement: DecisionConditionType["statement"],
) => {
  if (statement.type !== "comparison") {
    return "Advanced rule";
  }

  return `${formatComparisonOperand(statement.leftValue)} ${statement.operator} ${formatComparisonOperand(statement.rightValue)}`;
};

export const createDecisionEdge = ({
  conditionId,
  conditionOrder,
  sourceNodeId,
  statement,
  targetNodeId,
}: {
  conditionId: string;
  conditionOrder: number;
  sourceNodeId: string;
  statement: DecisionConditionType["statement"];
  targetNodeId: string;
}): GraphDecisionRuleEdge => ({
  data: {
    conditionId,
    conditionOrder,
    statement,
    type: "decision",
  },
  id: `decision:${sourceNodeId}:${conditionId}`,
  label: formatComparisonStatement(statement),
  source: sourceNodeId,
  sourceHandle: getDecisionRuleSourceHandleId(conditionId),
  target: targetNodeId,
  type: "builder",
});
