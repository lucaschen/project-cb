import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import type { ComparisonStatement } from "@packages/shared/db/schemas/conditionStatement";
import { ComparisonOperation } from "@packages/shared/types/enums";

import type {
  BuilderDecisionNode,
  BuilderFlowEdge,
  BuilderFlowNode,
  BuilderStepNode,
} from "../../../../utils/builderFlowToReactFlow";
import {
  formatComparisonStatement,
  isBuilderDecisionNode,
  isBuilderStepNode,
  isDecisionEdge,
  isDefaultEdge,
  isFallbackEdge,
} from "../../../../utils/builderFlowToReactFlow";
import {
  getTargetOptions,
  isEditableLiteralComparisonStatement,
} from "../../../../utils/builderGraph";

type BuilderSelectionPanelProps = {
  edge: BuilderFlowEdge | null;
  edges: BuilderFlowEdge[];
  node: BuilderFlowNode | null;
  nodes: BuilderFlowNode[];
  onAddDecisionRule: (nodeId: string) => void;
  onDeleteDecisionRule: (nodeId: string, conditionId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveDecisionRule: (
    nodeId: string,
    conditionId: string,
    direction: "down" | "up",
  ) => void;
  onSelectNode: (nodeId: string) => void;
  onUpdateDecisionRule: (
    nodeId: string,
    conditionId: string,
    updates: {
      statement?: ComparisonStatement;
      toNodeId?: string | null;
    },
  ) => void;
  onUpdateNode: (
    nodeId: string,
    updates:
      | (Partial<Pick<BuilderStepNode["data"], "name">> & {
          nextNodeId?: string | null;
        })
      | (Partial<Pick<BuilderDecisionNode["data"], "name">> & {
          fallbackNextNodeId?: string | null;
        }),
  ) => void;
};

type OperandKind = "number" | "string";

const COMPARISON_OPTIONS = Object.values(ComparisonOperation).map((operator) => ({
  id: operator,
  label: operator,
}));

const getNodeLabel = (
  nodes: BuilderFlowNode[],
  nodeId: string,
  fallbackLabel = "Target node",
) => {
  return nodes.find((node) => node.id === nodeId)?.data.name ?? fallbackLabel;
};

const SelectField = ({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
  value: string;
}) => {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <select
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option
            className="bg-slate-950 text-white"
            key={option.id}
            value={option.id}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const getOperandKind = (
  value: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
): OperandKind => {
  return typeof value === "number" ? "number" : "string";
};

const toLiteralOperand = (kind: OperandKind, rawValue: string) => {
  if (kind === "number") {
    return rawValue === "" ? 0 : Number(rawValue);
  }

  return rawValue;
};

const DecisionRuleEditor = ({
  canMoveDown,
  canMoveUp,
  rule,
  ruleIndex,
  nodeId,
  onDelete,
  onMove,
  onSelectNode,
  onUpdate,
  nodes,
  targetOptions,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  rule: BuilderDecisionNode["data"]["rules"][number];
  ruleIndex: number;
  nodeId: string;
  onDelete: (conditionId: string) => void;
  onMove: (conditionId: string, direction: "down" | "up") => void;
  onSelectNode: (nodeId: string) => void;
  onUpdate: (
    conditionId: string,
    updates: {
      statement?: ComparisonStatement;
      toNodeId?: string | null;
    },
  ) => void;
  nodes: BuilderFlowNode[];
  targetOptions: Array<{ id: string; label: string }>;
}) => {
  const statement = rule.statement;
  const targetLabel = rule.targetNodeId
    ? getNodeLabel(nodes, rule.targetNodeId)
    : "Not connected";
  const targetSelectOptions = [
    { id: "", label: "Not connected" },
    ...targetOptions,
  ];

  if (!isEditableLiteralComparisonStatement(statement)) {
    return (
      <div className="space-y-3 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
              Rule {ruleIndex + 1}
            </p>
            <p className="mt-1 text-sm text-slate-200">
              {formatComparisonStatement(statement)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Target: {targetLabel}</p>
          </div>
          <div className="flex gap-1">
            <Button
              className="h-8 px-2 text-xs"
              disabled={!canMoveUp}
              onClick={() => onMove(rule.conditionId, "up")}
              variant="secondary"
            >
              Up
            </Button>
            <Button
              className="h-8 px-2 text-xs"
              disabled={!canMoveDown}
              onClick={() => onMove(rule.conditionId, "down")}
              variant="secondary"
            >
              Down
            </Button>
          </div>
        </div>
        <p className="text-xs leading-5 text-slate-400">
          Advanced rule content is preserved but not editable in this panel yet.
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button
            className="h-8 px-3 text-xs"
            disabled={!rule.targetNodeId}
            onClick={() => rule.targetNodeId && onSelectNode(rule.targetNodeId)}
            variant="secondary"
          >
            Jump to target
          </Button>
          <Button
            className="h-8 px-3 text-xs"
            onClick={() => onDelete(rule.conditionId)}
            variant="secondary"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  const leftKind = getOperandKind(statement.leftValue);
  const rightKind = getOperandKind(statement.rightValue);

  return (
    <div className="space-y-3 rounded-2xl border border-fuchsia-300/20 bg-slate-950/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            Rule {ruleIndex + 1}
          </p>
          <p className="mt-1 text-xs text-slate-400">Target: {targetLabel}</p>
        </div>
        <div className="flex gap-1">
          <Button
            className="h-8 px-2 text-xs"
            disabled={!canMoveUp}
            onClick={() => onMove(rule.conditionId, "up")}
            variant="secondary"
          >
            Up
          </Button>
          <Button
            className="h-8 px-2 text-xs"
            disabled={!canMoveDown}
            onClick={() => onMove(rule.conditionId, "down")}
            variant="secondary"
          >
            Down
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <SelectField
          id={`${nodeId}-${rule.conditionId}-left-kind`}
          label="Left type"
          onChange={(value) =>
            onUpdate(rule.conditionId, {
              statement: {
                ...statement,
                leftValue: toLiteralOperand(value as OperandKind, String(statement.leftValue)),
              },
            })
          }
          options={[
            { id: "string", label: "String" },
            { id: "number", label: "Number" },
          ]}
          value={leftKind}
        />
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Left value
          </span>
          <input
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) =>
              onUpdate(rule.conditionId, {
                statement: {
                  ...statement,
                  leftValue: toLiteralOperand(leftKind, event.target.value),
                },
              })
            }
            type={leftKind === "number" ? "number" : "text"}
            value={String(statement.leftValue)}
          />
        </label>
      </div>

      <div className="space-y-2">
        <SelectField
          id={`${nodeId}-${rule.conditionId}-operator`}
          label="Operator"
          onChange={(value) =>
            onUpdate(rule.conditionId, {
              statement: {
                ...statement,
                operator: value as ComparisonOperation,
              },
            })
          }
          options={COMPARISON_OPTIONS}
          value={statement.operator}
        />
      </div>

      <div className="space-y-2">
        <SelectField
          id={`${nodeId}-${rule.conditionId}-right-kind`}
          label="Right type"
          onChange={(value) =>
            onUpdate(rule.conditionId, {
              statement: {
                ...statement,
                rightValue: toLiteralOperand(
                  value as OperandKind,
                  String(statement.rightValue),
                ),
              },
            })
          }
          options={[
            { id: "string", label: "String" },
            { id: "number", label: "Number" },
          ]}
          value={rightKind}
        />
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Right value
          </span>
          <input
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) =>
              onUpdate(rule.conditionId, {
                statement: {
                  ...statement,
                  rightValue: toLiteralOperand(rightKind, event.target.value),
                },
              })
            }
            type={rightKind === "number" ? "number" : "text"}
            value={String(statement.rightValue)}
          />
        </label>
      </div>

      <div className="space-y-2">
        <SelectField
          id={`${nodeId}-${rule.conditionId}-target`}
          label="Target node"
          onChange={(value) =>
            onUpdate(rule.conditionId, { toNodeId: value.length > 0 ? value : null })
          }
          options={targetSelectOptions}
          value={rule.targetNodeId ?? ""}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-10 px-3 text-xs"
            disabled={!rule.targetNodeId}
            onClick={() => rule.targetNodeId && onSelectNode(rule.targetNodeId)}
            variant="secondary"
          >
            Jump
          </Button>
          <Button
            className="h-10 px-3 text-xs"
            onClick={() => onDelete(rule.conditionId)}
            variant="secondary"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const BuilderSelectionPanel = ({
  edge,
  edges,
  node,
  nodes,
  onAddDecisionRule,
  onDeleteDecisionRule,
  onDeleteEdge,
  onDeleteNode,
  onMoveDecisionRule,
  onSelectNode,
  onUpdateDecisionRule,
  onUpdateNode,
}: BuilderSelectionPanelProps) => {
  if (node) {
    if (isBuilderStepNode(node)) {
      const targetOptions = [
        { id: "__NONE__", label: "Not connected" },
        ...getTargetOptions(nodes, node.id),
      ];
      const nextEdge = edges.find(
        (candidate) => candidate.source === node.id && isDefaultEdge(candidate),
      );

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Step</h3>
          <FormField
            id="selected-step-name"
            label="Name"
            onChange={(event) =>
              onUpdateNode(node.id, { name: event.target.value })
            }
            value={node.data.name}
          />
          <SelectField
            id="selected-step-next-node"
            label="Next node"
            onChange={(value) =>
              onUpdateNode(node.id, {
                nextNodeId: value === "__NONE__" ? null : value,
              })
            }
            options={targetOptions}
            value={nextEdge?.target ?? "__NONE__"}
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300">
            {node.data.elements.length} step element
            {node.data.elements.length === 1 ? "" : "s"}
          </div>
          <Button
            className="h-10 w-full px-3 text-sm"
            onClick={() => onDeleteNode(node.id)}
            variant="secondary"
          >
            Delete step
          </Button>
        </div>
      );
    }

    const decisionNode = isBuilderDecisionNode(node) ? node : null;

    if (!decisionNode) {
      return null;
    }

    const ruleTargetOptions = getTargetOptions(nodes, node.id);
    const fallbackOptions = [
      { id: "", label: "No fallback selected" },
      ...ruleTargetOptions,
    ];
    const fallbackEdge = edges.find(
      (candidate) =>
        candidate.source === decisionNode.id && isFallbackEdge(candidate),
    );
    const decisionRules = decisionNode.data.rules;

      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Decision</h3>
        <FormField
          id="selected-decision-name"
          label="Name"
          onChange={(event) =>
            onUpdateNode(node.id, { name: event.target.value })
          }
          value={decisionNode.data.name}
        />
        <SelectField
          id="selected-decision-fallback"
          label="Fallback target"
          onChange={(value) =>
            onUpdateNode(decisionNode.id, { fallbackNextNodeId: value })
          }
          options={fallbackOptions}
          value={fallbackEdge?.target ?? ""}
        />
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Rules
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Add ordered comparison rules to branch from this node.
              </p>
            </div>
            <Button
              className="h-9 px-3 text-xs"
              onClick={() => onAddDecisionRule(decisionNode.id)}
              variant="secondary"
            >
              Add rule
            </Button>
          </div>
          {decisionRules.length === 0 ? (
            <p className="text-sm text-slate-500">
              No decision rules yet. Add a rule to create a new branch edge.
            </p>
          ) : (
            <div className="space-y-3">
              {decisionRules.map((decisionRule, index) => (
                <DecisionRuleEditor
                  canMoveDown={index < decisionRules.length - 1}
                  canMoveUp={index > 0}
                  key={decisionRule.conditionId}
                  nodeId={decisionNode.id}
                  rule={decisionRule}
                  ruleIndex={index}
                  onDelete={(conditionId) =>
                    onDeleteDecisionRule(decisionNode.id, conditionId)
                  }
                  onMove={(conditionId, direction) =>
                    onMoveDecisionRule(decisionNode.id, conditionId, direction)
                  }
                  onSelectNode={onSelectNode}
                  onUpdate={(conditionId, updates) =>
                    onUpdateDecisionRule(decisionNode.id, conditionId, updates)
                  }
                  nodes={nodes}
                  targetOptions={ruleTargetOptions}
                />
              ))}
            </div>
          )}
        </div>
        <Button
          className="h-10 w-full px-3 text-sm"
          onClick={() => onDeleteNode(decisionNode.id)}
          variant="secondary"
        >
          Delete decision
        </Button>
      </div>
    );
  }

  if (edge) {
    const sourceLabel =
      nodes.find((candidate) => candidate.id === edge.source)?.data.name ??
      edge.source;
    const targetLabel =
      nodes.find((candidate) => candidate.id === edge.target)?.data.name ??
      edge.target;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Connection</h3>
        <p className="text-sm leading-5 text-slate-400">
          {sourceLabel} to {targetLabel}
        </p>
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
          <p>
            Type:{" "}
            {isDefaultEdge(edge)
              ? "Step next node"
              : isFallbackEdge(edge)
                ? "Decision fallback"
                : "Decision rule"}
          </p>
          {isDecisionEdge(edge) ? (
            <p>{formatComparisonStatement(edge.data.statement)}</p>
          ) : null}
        </div>
        {isDefaultEdge(edge) ? (
          <Button
            className="h-10 w-full px-3 text-sm"
            onClick={() => onDeleteEdge(edge.id)}
            variant="secondary"
          >
            Delete connection
          </Button>
        ) : (
          <p className="text-sm leading-5 text-slate-400">
            Decision edges are managed from the decision editor.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white">Nothing selected</h3>
      <p className="text-sm leading-5 text-slate-400">
        Choose a node or connection from the canvas or structure list.
      </p>
    </div>
  );
};

export default BuilderSelectionPanel;
