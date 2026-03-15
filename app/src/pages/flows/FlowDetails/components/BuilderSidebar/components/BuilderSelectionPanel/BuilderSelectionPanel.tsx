import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import useBuilderStore from "@app/pages/flows/FlowDetails/store/builderStore";
import type { ComparisonStatement } from "@packages/shared/db/schemas/conditionStatement";
import FlowGraphDecisionNodeEntity from "@packages/shared/entities/FlowGraphDecisionNodeEntity/FlowGraphDecisionNodeEntity";
import type {
  FlowGraphNode,
  GraphDecisionNode,
} from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import { getDecisionRuleSourceHandleId } from "@packages/shared/entities/FlowGraphEntity/utils/graph";
import { ComparisonOperation } from "@packages/shared/types/enums";

import {
  formatComparisonStatement,
  isDecisionFallbackEdge,
  isDecisionRuleEdge,
  isDefaultEdge,
  isGraphDecisionNode,
  isGraphStepNode,
} from "../../../../utils/builderFlowToReactFlow";

type OperandKind = "number" | "string";

const COMPARISON_OPTIONS = Object.values(ComparisonOperation).map(
  (operator) => ({
    id: operator,
    label: operator,
  }),
);

const getNodeLabel = (
  nodes: FlowGraphNode[],
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

const SectionEyebrow = ({ children }: { children: string }) => {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
      {children}
    </p>
  );
};

const PanelHeader = ({ title, detail }: { title: string; detail?: string }) => {
  return (
    <div className="space-y-1">
      <SectionEyebrow>{title}</SectionEyebrow>
      {detail ? (
        <p className="text-sm leading-5 text-slate-400">{detail}</p>
      ) : null}
    </div>
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
  nodeId,
  nodes,
  onDelete,
  onMove,
  onSelectNode,
  onUpdate,
  rule,
  ruleIndex,
  targetNodeId,
  targetOptions,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  nodeId: string;
  nodes: FlowGraphNode[];
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
  rule: GraphDecisionNode["data"]["rules"][number];
  ruleIndex: number;
  targetNodeId: string | null;
  targetOptions: Array<{ id: string; label: string }>;
}) => {
  const statement = rule.statement;
  const targetLabel = targetNodeId
    ? getNodeLabel(nodes, targetNodeId)
    : "Not connected";
  const targetSelectOptions = [
    { id: "", label: "Not connected" },
    ...targetOptions,
  ];
  const isEditable =
    statement.type === "comparison" &&
    (typeof statement.leftValue === "string" ||
      typeof statement.leftValue === "number") &&
    (typeof statement.rightValue === "string" ||
      typeof statement.rightValue === "number");

  if (!isEditable) {
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-8 px-3 text-xs"
            disabled={!targetNodeId}
            onClick={() => targetNodeId && onSelectNode(targetNodeId)}
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
                leftValue: toLiteralOperand(
                  value as OperandKind,
                  String(statement.leftValue),
                ),
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
            onUpdate(rule.conditionId, {
              toNodeId: value.length > 0 ? value : null,
            })
          }
          options={targetSelectOptions}
          value={targetNodeId ?? ""}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-10 px-3 text-xs"
            disabled={!targetNodeId}
            onClick={() => targetNodeId && onSelectNode(targetNodeId)}
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

const BuilderSelectionPanel = () => {
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);
  const selectedItem = useBuilderStore((state) => state.selectedItem);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const updateGraph = useBuilderStore((state) => state.updateGraph);

  const selectedNode =
    selectedItem?.kind === "node"
      ? (nodes.find((node) => node.id === selectedItem.id) ?? null)
      : null;
  const selectedEdge =
    selectedItem?.kind === "edge"
      ? (edges.find((edge) => edge.id === selectedItem.id) ?? null)
      : null;

  if (selectedNode) {
    if (isGraphStepNode(selectedNode)) {
      const targetOptions = [
        { id: "__NONE__", label: "Not connected" },
        ...nodes
          .filter((node) => node.id !== selectedNode.id)
          .map((node) => ({
            id: node.id,
            label: `${node.data.name} (${node.type === "step" ? "Step" : "Decision"})`,
          }))
          .sort((left, right) => left.label.localeCompare(right.label)),
      ];
      const nextEdge = edges.find(
        (candidate) =>
          candidate.source === selectedNode.id && isDefaultEdge(candidate),
      );

      return (
        <div className="space-y-3">
          <PanelHeader
            detail={`${selectedNode.data.elements.length} step element${
              selectedNode.data.elements.length === 1 ? "" : "s"
            }`}
            title="Step"
          />
          <FormField
            id="selected-step-name"
            label="Name"
            onChange={(event) =>
              updateGraph((graph) => {
                const node = graph.getNodeById(selectedNode.id);

                if (!node) {
                  return;
                }

                node.data.name = event.target.value;
              })
            }
            value={selectedNode.data.name}
          />
          <SelectField
            id="selected-step-next-node"
            label="Next node"
            onChange={(value) =>
              updateGraph((graph) => {
                graph.setConnection({
                  sourceNodeId: selectedNode.id,
                  targetNodeId: value === "__NONE__" ? null : value,
                });
              })
            }
            options={targetOptions}
            value={nextEdge?.target ?? "__NONE__"}
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs uppercase tracking-[0.18em] text-slate-400">
            FE 09 owns deep step editing
          </div>
          <Button
            className="h-9 w-full px-3 text-sm"
            onClick={() => {
              updateGraph((graph) => {
                graph.removeNodeById(selectedNode.id);
              });
              selectItem(null);
            }}
            variant="secondary"
          >
            Delete step
          </Button>
        </div>
      );
    }

    if (!isGraphDecisionNode(selectedNode)) {
      return null;
    }

    const ruleTargetOptions = nodes
      .filter((node) => node.id !== selectedNode.id)
      .map((node) => ({
        id: node.id,
        label: `${node.data.name} (${node.type === "step" ? "Step" : "Decision"})`,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
    const fallbackOptions = [
      { id: "", label: "No fallback selected" },
      ...ruleTargetOptions,
    ];
    const fallbackEdge = edges.find(
      (candidate) =>
        candidate.source === selectedNode.id &&
        isDecisionFallbackEdge(candidate),
    );
    const decisionRules = selectedNode.data.rules;

    return (
      <div className="space-y-3">
        <PanelHeader
          detail={`${decisionRules.length} branch rule${
            decisionRules.length === 1 ? "" : "s"
          }`}
          title="Decision"
        />
        <FormField
          id="selected-decision-name"
          label="Name"
          onChange={(event) =>
            updateGraph((graph) => {
              const node = graph.getNodeById(selectedNode.id);

              if (!node) {
                return;
              }

              node.data.name = event.target.value;
            })
          }
          value={selectedNode.data.name}
        />
        <SelectField
          id="selected-decision-fallback"
          label="Fallback target"
          onChange={(value) =>
            updateGraph((graph) => {
              const node = graph.getNodeById(selectedNode.id);

              if (!node) return;

              graph.setConnection({
                sourceNodeId: node.id,
                targetNodeId: value,
              });
            })
          }
          options={fallbackOptions}
          value={fallbackEdge?.target ?? ""}
        />
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <SectionEyebrow>Rules</SectionEyebrow>
              <p className="text-sm leading-5 text-slate-400">
                Ordered branches for this decision.
              </p>
            </div>
            <Button
              className="h-8 px-3 text-xs"
              onClick={() =>
                updateGraph((graph) => {
                  const node = graph.getNodeById(selectedNode.id);

                  if (!(node instanceof FlowGraphDecisionNodeEntity)) {
                    return;
                  }

                  node.addRule();
                })
              }
              variant="secondary"
            >
              Add rule
            </Button>
          </div>
          {decisionRules.length === 0 ? (
            <p className="text-sm leading-5 text-slate-500">
              No rules yet. Add one to create another branch.
            </p>
          ) : (
            <div className="space-y-3">
              {decisionRules.map((decisionRule, index) => (
                <DecisionRuleEditor
                  canMoveDown={index < decisionRules.length - 1}
                  canMoveUp={index > 0}
                  key={decisionRule.conditionId}
                  nodeId={selectedNode.id}
                  nodes={nodes}
                  onDelete={(conditionId) =>
                    updateGraph((graph) => {
                      const node = graph.getNodeById(selectedNode.id);

                      if (!(node instanceof FlowGraphDecisionNodeEntity)) {
                        return;
                      }

                      node.removeRule(conditionId);
                    })
                  }
                  onMove={(conditionId, direction) =>
                    updateGraph((graph) => {
                      const node = graph.getNodeById(selectedNode.id);

                      if (!(node instanceof FlowGraphDecisionNodeEntity)) {
                        return;
                      }

                      node.moveRule(conditionId, direction);
                    })
                  }
                  onSelectNode={(nodeId) =>
                    selectItem({
                      id: nodeId,
                      kind: "node",
                    })
                  }
                  onUpdate={(conditionId, updates) =>
                    updateGraph((graph) => {
                      const node = graph.getNodeById(selectedNode.id);

                      if (!(node instanceof FlowGraphDecisionNodeEntity)) {
                        return;
                      }

                      if ("toNodeId" in updates) {
                        graph.setConnection({
                          sourceNodeId: node.id,
                          targetNodeId: updates.toNodeId ?? null,
                          sourceHandle:
                            getDecisionRuleSourceHandleId(conditionId),
                        });
                      }

                      if (updates.statement !== undefined) {
                        node.editRule(conditionId, {
                          statement: updates.statement,
                        });
                      }
                    })
                  }
                  rule={decisionRule}
                  ruleIndex={index}
                  targetNodeId={
                    edges.find(
                      (edge) =>
                        edge.source === selectedNode.id &&
                        edge.data.type === "decision" &&
                        edge.data.conditionId === decisionRule.conditionId,
                    )?.target ?? null
                  }
                  targetOptions={ruleTargetOptions}
                />
              ))}
            </div>
          )}
        </div>
        <Button
          className="h-9 w-full px-3 text-sm"
          onClick={() => {
            updateGraph((graph) => {
              graph.removeNodeById(selectedNode.id);
            });
            selectItem(null);
          }}
          variant="secondary"
        >
          Delete decision
        </Button>
      </div>
    );
  }

  if (selectedEdge) {
    const sourceLabel =
      nodes.find((candidate) => candidate.id === selectedEdge.source)?.data
        .name ?? selectedEdge.source;
    const targetLabel =
      nodes.find((candidate) => candidate.id === selectedEdge.target)?.data
        .name ?? selectedEdge.target;

    return (
      <div className="space-y-3">
        <PanelHeader
          detail={`${sourceLabel} to ${targetLabel}`}
          title="Connection"
        />
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
          <p>
            Type:{" "}
            {isDefaultEdge(selectedEdge)
              ? "Step next node"
              : isDecisionFallbackEdge(selectedEdge)
                ? "Decision fallback"
                : "Decision rule"}
          </p>
          {isDecisionRuleEdge(selectedEdge) ? (
            <p>{formatComparisonStatement(selectedEdge.data.statement)}</p>
          ) : null}
        </div>
        {isDefaultEdge(selectedEdge) ? (
          <Button
            className="h-9 w-full px-3 text-sm"
            onClick={() => {
              updateGraph((graph) => {
                graph.removeEdgeById(selectedEdge.id);
              });
              selectItem(null);
            }}
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
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
      <SectionEyebrow>Selection</SectionEyebrow>
      <p className="text-sm font-medium text-white">Nothing selected</p>
      <p className="text-sm leading-5 text-slate-400">
        Choose a node or connection from the canvas.
      </p>
    </div>
  );
};

export default BuilderSelectionPanel;
