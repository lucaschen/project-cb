import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import Modal from "@app/components/ui/Modal";
import useFlowNodeContentStore from "@app/pages/flows/FlowDetails/store/flowNodeContentStore";
import type {
  ComparisonStatement,
  ConditionStatement,
} from "@packages/shared/db/schemas/conditionStatement";
import FlowGraphDecisionNodeEntity from "@packages/shared/entities/FlowGraphDecisionNodeEntity/FlowGraphDecisionNodeEntity";
import type { GraphDecisionNode } from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import { getDecisionRuleSourceHandleId } from "@packages/shared/entities/FlowGraphEntity/utils/graph";
import { ComparisonOperation } from "@packages/shared/types/enums";
import { AlertCircle, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import useBuilderStore from "../../store/builderStore";
import {
  isDecisionFallbackEdge,
  isGraphDecisionNode,
} from "../../utils/builderFlowToReactFlow";
import {
  formatElementReference,
  getElementReferenceName,
} from "./stepElementReferences";
import { formatComparisonStatement } from "@packages/shared/entities/FlowGraphDecisionNodeEntity/utils/graphDecisionNode";

type DecisionNodeModalProps = {
  initialRuleConditionId?: string | null;
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
};

type DecisionRuleDraft = {
  conditionId: string;
  statement: ConditionStatement;
  targetNodeId: string | null;
};

type DecisionDraft = {
  fallbackTargetNodeId: string | null;
  name: string;
  rules: DecisionRuleDraft[];
};

type OperandKind = "number" | "randomNumber" | "stepElementValue" | "string";

type ValidationState = {
  fallbackErrors: string[];
  ruleErrorsById: Record<string, string[]>;
};

type StepElementOption = {
  id: string;
  label: string;
};

type DecisionNodeModalEditorProps = {
  initialDraft: DecisionDraft;
  initialRuleConditionId?: string | null;
  isOpen: boolean;
  node: GraphDecisionNode;
  onClose: () => void;
  stepElementOptions: StepElementOption[];
  targetNodeOptions: { id: string; label: string }[];
  updateGraph: ReturnType<typeof useBuilderStore.getState>["updateGraph"];
};

const OPERATORS = Object.values(ComparisonOperation).map((operator) => ({
  id: operator,
  label: operator,
}));

const RULE_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#84cc16"];

const LABEL_CLASS_NAME =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";
const SELECT_CLASS_NAME =
  "w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300";
const MINI_SELECT_CLASS_NAME =
  "w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-2 text-sm text-white outline-none transition focus:border-sky-300";
const MINI_INPUT_CLASS_NAME =
  "w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-2 text-sm text-white outline-none transition focus:border-sky-300";

const getOperandKind = (
  operand: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
): OperandKind => {
  if (typeof operand === "number") {
    return "number";
  }

  if (typeof operand === "string") {
    return "string";
  }

  if (operand.type === "randomNumber") {
    return "randomNumber";
  }

  return "stepElementValue";
};

const isRandomNumberOperand = (
  operand: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
): operand is Extract<
  ComparisonStatement["leftValue"],
  { type: "randomNumber" }
> =>
  typeof operand === "object" &&
  operand !== null &&
  "type" in operand &&
  operand.type === "randomNumber";

const isStepElementValueOperand = (
  operand: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
): operand is Extract<
  ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
  { type: "stepElementValue" }
> =>
  typeof operand === "object" &&
  operand !== null &&
  "type" in operand &&
  operand.type === "stepElementValue";

const createDefaultOperand = (
  kind: OperandKind,
  side: "left" | "right",
): ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"] => {
  if (kind === "number") {
    return 0;
  }

  if (kind === "string") {
    return "";
  }

  if (kind === "stepElementValue") {
    return {
      stepElementId: "",
      type: "stepElementValue",
    };
  }

  if (side === "right") {
    return "";
  }

  return {
    max: 1,
    min: 0,
    type: "randomNumber",
  };
};

const getTargetLabel = (
  targetNodeId: string | null,
  targetNodeOptions: { id: string; label: string }[],
) =>
  targetNodeId
    ? (targetNodeOptions.find((option) => option.id === targetNodeId)?.label ??
      "Unknown target")
    : "Not connected";

const getRuleSummary = (statement: ConditionStatement) =>
  statement.type === "comparison"
    ? formatComparisonStatement(statement)
    : "Unsupported rule";

const getDecisionDraftFromNode = (
  node: GraphDecisionNode,
  edges: ReturnType<typeof useBuilderStore.getState>["edges"],
): DecisionDraft => ({
  fallbackTargetNodeId:
    edges.find(
      (edge) => edge.source === node.id && isDecisionFallbackEdge(edge),
    )?.target ?? null,
  name: node.data.name,
  rules: node.data.rules.map((rule) => ({
    conditionId: rule.conditionId,
    statement: structuredClone(rule.statement),
    targetNodeId:
      edges.find(
        (edge) =>
          edge.source === node.id &&
          edge.data.type === "decision" &&
          edge.data.conditionId === rule.conditionId,
      )?.target ?? null,
  })),
});

const getDecisionDraftValidationState = (
  draft: Pick<DecisionDraft, "fallbackTargetNodeId" | "rules">,
  validStepElementIds: Set<string>,
): ValidationState => {
  const fallbackErrors: string[] = [];
  const ruleErrorsById: Record<string, string[]> = {};

  if (!draft.fallbackTargetNodeId) {
    fallbackErrors.push("Decision fallback target is required.");
  }

  for (const [index, rule] of draft.rules.entries()) {
    if (rule.statement.type !== "comparison") {
      continue;
    }

    const ruleErrors: string[] = [];
    const leftKind = getOperandKind(rule.statement.leftValue);
    const rightKind = getOperandKind(rule.statement.rightValue);

    if (
      leftKind === "number" &&
      !Number.isFinite(Number(rule.statement.leftValue))
    ) {
      ruleErrors.push(`Rule ${index + 1} has an invalid left numeric value.`);
    }

    if (
      rightKind === "number" &&
      !Number.isFinite(Number(rule.statement.rightValue))
    ) {
      ruleErrors.push(`Rule ${index + 1} has an invalid right numeric value.`);
    }

    if (
      leftKind === "randomNumber" &&
      isRandomNumberOperand(rule.statement.leftValue) &&
      rule.statement.leftValue.min > rule.statement.leftValue.max
    ) {
      ruleErrors.push(
        `Rule ${index + 1} random range must have min less than or equal to max.`,
      );
    }

    if (
      leftKind === "stepElementValue" &&
      (!isStepElementValueOperand(rule.statement.leftValue) ||
        !validStepElementIds.has(rule.statement.leftValue.stepElementId))
    ) {
      ruleErrors.push(
        `Rule ${index + 1} references an unknown left step element.`,
      );
    }

    if (
      rightKind === "stepElementValue" &&
      (!isStepElementValueOperand(rule.statement.rightValue) ||
        !validStepElementIds.has(rule.statement.rightValue.stepElementId))
    ) {
      ruleErrors.push(
        `Rule ${index + 1} references an unknown right step element.`,
      );
    }

    if (ruleErrors.length > 0) {
      ruleErrorsById[rule.conditionId] = ruleErrors;
    }
  }

  return {
    fallbackErrors,
    ruleErrorsById,
  };
};

const OperandValueControl = ({
  kind,
  onValueChange,
  options,
  side,
  statement,
}: {
  kind: OperandKind;
  onValueChange: (
    value: ComparisonStatement["leftValue"] | ComparisonStatement["rightValue"],
  ) => void;
  options: StepElementOption[];
  side: "left" | "right";
  statement: ComparisonStatement;
}) => {
  const value = side === "left" ? statement.leftValue : statement.rightValue;
  const selectedStepElementId = isStepElementValueOperand(value)
    ? value.stepElementId
    : "";
  const hasSelectedOption = options.some(
    (option) => option.id === selectedStepElementId,
  );
  const unresolvedStepElementId =
    selectedStepElementId.length > 0 && !hasSelectedOption
      ? selectedStepElementId
      : null;

  return kind === "stepElementValue" ? (
    <select
      className={MINI_SELECT_CLASS_NAME}
      onChange={(event) =>
        onValueChange({
          stepElementId: event.target.value,
          type: "stepElementValue",
        })
      }
      value={selectedStepElementId}
    >
      <option value="">Select step element</option>
      {unresolvedStepElementId ? (
        <option disabled value={unresolvedStepElementId}>
          unresolved: {unresolvedStepElementId}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  ) : kind === "randomNumber" ? (
    <div className="grid grid-cols-2 gap-2">
      <input
        className={MINI_INPUT_CLASS_NAME}
        onChange={(event) =>
          onValueChange({
            ...(isRandomNumberOperand(value)
              ? value
              : { max: 1, min: 0, type: "randomNumber" }),
            min: Number(event.target.value),
          })
        }
        placeholder="Min"
        type="number"
        value={isRandomNumberOperand(value) ? value.min : 0}
      />
      <input
        className={MINI_INPUT_CLASS_NAME}
        onChange={(event) =>
          onValueChange({
            ...(isRandomNumberOperand(value)
              ? value
              : { max: 1, min: 0, type: "randomNumber" }),
            max: Number(event.target.value),
          })
        }
        placeholder="Max"
        type="number"
        value={isRandomNumberOperand(value) ? value.max : 1}
      />
    </div>
  ) : (
    <input
      className={MINI_INPUT_CLASS_NAME}
      onChange={(event) =>
        onValueChange(
          kind === "number" ? Number(event.target.value) : event.target.value,
        )
      }
      placeholder={kind === "number" ? "0" : "Enter value"}
      type={kind === "number" ? "number" : "text"}
      value={
        typeof value === "number" || typeof value === "string"
          ? String(value)
          : ""
      }
    />
  );
};

const CompactField = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <label className="space-y-1.5">
    <span className={LABEL_CLASS_NAME}>{label}</span>
    {children}
  </label>
);

const OperandTypeSelect = ({
  allowRandomNumber,
  kind,
  onChange,
}: {
  allowRandomNumber: boolean;
  kind: OperandKind;
  onChange: (kind: OperandKind) => void;
}) => (
  <select
    className={MINI_SELECT_CLASS_NAME}
    onChange={(event) => onChange(event.target.value as OperandKind)}
    value={kind}
  >
    <option value="string">String</option>
    <option value="number">Number</option>
    <option value="stepElementValue">Step element</option>
    {allowRandomNumber ? (
      <option value="randomNumber">Random number</option>
    ) : null}
  </select>
);

const DecisionNodeModalEditor = ({
  initialDraft,
  initialRuleConditionId,
  isOpen,
  node,
  onClose,
  stepElementOptions,
  targetNodeOptions,
  updateGraph,
}: DecisionNodeModalEditorProps) => {
  const [draft, setDraft] = useState<DecisionDraft>(initialDraft);
  const [activeRuleConditionId, setActiveRuleConditionId] = useState<
    string | null
  >(initialRuleConditionId ?? initialDraft.rules[0]?.conditionId ?? null);

  const validationState = useMemo(
    () =>
      getDecisionDraftValidationState(
        draft,
        new Set(stepElementOptions.map((option) => option.id)),
      ),
    [draft, stepElementOptions],
  );

  const validationErrors = useMemo(
    () => [
      ...validationState.fallbackErrors,
      ...Object.values(validationState.ruleErrorsById).flat(),
    ],
    [validationState],
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(initialDraft) !== JSON.stringify(draft);
  }, [draft, initialDraft]);

  const activeRule = useMemo(
    () =>
      draft?.rules.find((rule) => rule.conditionId === activeRuleConditionId) ??
      null,
    [activeRuleConditionId, draft],
  );

  const handleRequestClose = () => {
    if (!isDirty || window.confirm("Discard unsaved node changes?")) {
      onClose();
    }
  };

  const updateRule = (
    conditionId: string,
    updater: (rule: DecisionRuleDraft) => DecisionRuleDraft,
  ) => {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            rules: currentDraft.rules.map((rule) =>
              rule.conditionId === conditionId ? updater(rule) : rule,
            ),
          }
        : currentDraft,
    );
  };

  const moveRule = (conditionId: string, direction: "down" | "up") => {
    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const currentIndex = currentDraft.rules.findIndex(
        (rule) => rule.conditionId === conditionId,
      );

      if (currentIndex === -1) {
        return currentDraft;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentDraft.rules.length) {
        return currentDraft;
      }

      const nextRules = [...currentDraft.rules];
      const [movedRule] = nextRules.splice(currentIndex, 1);
      nextRules.splice(targetIndex, 0, movedRule);

      return {
        ...currentDraft,
        rules: nextRules,
      };
    });
  };

  const deleteRule = (conditionId: string) => {
    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const deletedIndex = currentDraft.rules.findIndex(
        (rule) => rule.conditionId === conditionId,
      );
      const nextRules = currentDraft.rules.filter(
        (rule) => rule.conditionId !== conditionId,
      );

      setActiveRuleConditionId(
        nextRules[Math.min(deletedIndex, nextRules.length - 1)]?.conditionId ??
          null,
      );

      return {
        ...currentDraft,
        rules: nextRules,
      };
    });
  };

  const addRule = () => {
    const conditionId = crypto.randomUUID();

    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            rules: currentDraft.rules.concat({
              conditionId,
              statement: {
                leftValue: "",
                operator: ComparisonOperation.EQ,
                rightValue: "",
                type: "comparison",
              },
              targetNodeId: null,
            }),
          }
        : currentDraft,
    );
    setActiveRuleConditionId(conditionId);
  };

  const saveDraft = () => {
    if (validationErrors.length > 0) {
      return;
    }

    updateGraph((graph) => {
      const graphNode = graph.getNodeById(node.id);

      if (!(graphNode instanceof FlowGraphDecisionNodeEntity)) {
        return;
      }

      graphNode.data.name = draft.name;
      graphNode.replaceRules(
        draft.rules.map((rule) => ({
          conditionId: rule.conditionId,
          statement: rule.statement,
        })),
      );
      graph.setConnection({
        sourceNodeId: graphNode.id,
        targetNodeId: draft.fallbackTargetNodeId,
      });

      draft.rules.forEach((rule) => {
        graph.setConnection({
          sourceHandle: getDecisionRuleSourceHandleId(rule.conditionId),
          sourceNodeId: graphNode.id,
          targetNodeId: rule.targetNodeId,
        });
      });
    });

    onClose();
  };

  const activeRuleIndex = activeRule
    ? draft.rules.findIndex(
        (rule) => rule.conditionId === activeRule.conditionId,
      )
    : -1;
  const activeRuleErrors = activeRule
    ? (validationState.ruleErrorsById[activeRule.conditionId] ?? [])
    : [];
  const activeRuleStatement =
    activeRule?.statement.type === "comparison" ? activeRule.statement : null;

  return (
    <Modal
      actions={
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            {validationErrors.length > 0
              ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"} to fix`
              : isDirty
                ? "Ready to save changes"
                : "No unsaved changes"}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRequestClose} variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={validationErrors.length > 0 || !isDirty}
              onClick={saveDraft}
            >
              Save
            </Button>
          </div>
        </div>
      }
      description="Review the decision, scan every branch quickly, and edit one rule at a time."
      isOpen={isOpen}
      onClose={handleRequestClose}
      size="xl"
      title={`Decision editor: ${node.data.name}`}
    >
      <div className="flex min-h-0 h-full flex-col">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <FormField
              id="decision-editor-name"
              label="Decision name"
              onChange={(event) =>
                setDraft((currentDraft) =>
                  currentDraft
                    ? { ...currentDraft, name: event.target.value }
                    : currentDraft,
                )
              }
              value={draft.name}
            />
            <label className="block space-y-1.5">
              <span className={LABEL_CLASS_NAME}>Fallback target</span>
              <select
                className={SELECT_CLASS_NAME}
                onChange={(event) =>
                  setDraft((currentDraft) =>
                    currentDraft
                      ? {
                          ...currentDraft,
                          fallbackTargetNodeId:
                            event.target.value.length > 0
                              ? event.target.value
                              : null,
                        }
                      : currentDraft,
                  )
                }
                value={draft.fallbackTargetNodeId ?? ""}
              >
                <option className="bg-slate-950 text-white" value="">
                  No fallback selected
                </option>
                {targetNodeOptions.map((option) => (
                  <option
                    className="bg-slate-950 text-white"
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {validationState.fallbackErrors.length > 0 ? (
                <p className="text-xs text-amber-200">
                  {validationState.fallbackErrors[0]}
                </p>
              ) : null}
            </label>
            <div className="flex items-end">
              <Button
                className="h-10 gap-2 px-4"
                onClick={addRule}
                variant="secondary"
              >
                <Plus className="h-4 w-4" />
                Add rule
              </Button>
            </div>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-h-0 border-r border-white/10 bg-slate-950/45">
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Rules
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Scan branches here, then edit the selected rule on the right.
                </p>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {draft.rules.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                    No rules yet. Add a rule to start branching from this
                    decision.
                  </div>
                ) : (
                  draft.rules.map((rule, index) => {
                    const isActive = rule.conditionId === activeRuleConditionId;
                    const ruleErrors =
                      validationState.ruleErrorsById[rule.conditionId] ?? [];
                    const ruleColor = RULE_COLORS[index % RULE_COLORS.length];

                    return (
                      <div
                        className={`rounded-2xl border transition ${
                          isActive
                            ? "border-fuchsia-300/40 bg-fuchsia-300/10 shadow-[0_0_0_1px_rgba(232,121,249,0.08)]"
                            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                        key={rule.conditionId}
                      >
                        <button
                          className="w-full px-3 py-3 text-left"
                          onClick={() =>
                            setActiveRuleConditionId(rule.conditionId)
                          }
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: ruleColor }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white">
                                    Rule {index + 1}
                                  </p>
                                  <p className="truncate text-sm text-slate-300">
                                    {getRuleSummary(rule.statement)}
                                  </p>
                                </div>
                                {ruleErrors.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-100">
                                    <AlertCircle className="h-3 w-3" />
                                    {ruleErrors.length}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-400">
                                {getTargetLabel(
                                  rule.targetNodeId,
                                  targetNodeOptions,
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 border-t border-white/10 px-2 py-2">
                          <Button
                            className="h-8 w-8 px-0"
                            disabled={index === 0}
                            onClick={() => moveRule(rule.conditionId, "up")}
                            variant="secondary"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            className="h-8 w-8 px-0"
                            disabled={index === draft.rules.length - 1}
                            onClick={() => moveRule(rule.conditionId, "down")}
                            variant="secondary"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex-1" />
                          <Button
                            className="h-8 w-8 px-0 text-slate-300 hover:text-white"
                            onClick={() => deleteRule(rule.conditionId)}
                            variant="secondary"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="min-h-0 overflow-y-auto px-5 py-4">
            {!activeRule ? (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center text-sm text-slate-400">
                Select a rule from the left rail to edit it here.
              </div>
            ) : (
              <div className="space-y-4">
                {activeRuleStatement ? (
                  <>
                    {activeRuleErrors.length > 0 ? (
                      <div className="space-y-1 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                        {activeRuleErrors.map((error) => (
                          <p key={error}>{error}</p>
                        ))}
                      </div>
                    ) : null}

                    <div className="space-y-4 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">
                          Rule {activeRuleIndex + 1} ~{" "}
                          <span className="text-lg font-semibold text-white">
                            {getRuleSummary(activeRule.statement)}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Edit the branch condition inline, then choose where
                          this rule goes.
                        </p>
                      </div>
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="grid gap-3 xl:grid-cols-[160px_minmax(0,1fr)_140px_160px_minmax(0,1fr)]">
                          <CompactField label="Left type">
                            <OperandTypeSelect
                              allowRandomNumber
                              kind={getOperandKind(
                                activeRuleStatement.leftValue,
                              )}
                              onChange={(nextKind) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    statement: {
                                      ...currentRule.statement,
                                      leftValue: createDefaultOperand(
                                        nextKind,
                                        "left",
                                      ) as ComparisonStatement["leftValue"],
                                    },
                                  }),
                                )
                              }
                            />
                          </CompactField>
                          <CompactField label="Left value">
                            <OperandValueControl
                              kind={getOperandKind(
                                activeRuleStatement.leftValue,
                              )}
                              onValueChange={(value) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    statement: {
                                      ...currentRule.statement,
                                      leftValue:
                                        value as ComparisonStatement["leftValue"],
                                    },
                                  }),
                                )
                              }
                              options={stepElementOptions}
                              side="left"
                              statement={activeRuleStatement}
                            />
                          </CompactField>
                          <CompactField label="Operator">
                            <select
                              className={MINI_SELECT_CLASS_NAME}
                              onChange={(event) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    statement: {
                                      ...currentRule.statement,
                                      operator: event.target
                                        .value as ComparisonOperation,
                                    },
                                  }),
                                )
                              }
                              value={activeRuleStatement.operator}
                            >
                              {OPERATORS.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </CompactField>
                          <CompactField label="Right type">
                            <OperandTypeSelect
                              allowRandomNumber={false}
                              kind={getOperandKind(
                                activeRuleStatement.rightValue,
                              )}
                              onChange={(nextKind) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    statement: {
                                      ...currentRule.statement,
                                      rightValue: createDefaultOperand(
                                        nextKind,
                                        "right",
                                      ) as ComparisonStatement["rightValue"],
                                    },
                                  }),
                                )
                              }
                            />
                          </CompactField>
                          <CompactField label="Right value">
                            <OperandValueControl
                              kind={getOperandKind(
                                activeRuleStatement.rightValue,
                              )}
                              onValueChange={(value) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    statement: {
                                      ...currentRule.statement,
                                      rightValue:
                                        value as ComparisonStatement["rightValue"],
                                    },
                                  }),
                                )
                              }
                              options={stepElementOptions}
                              side="right"
                              statement={activeRuleStatement}
                            />
                          </CompactField>
                        </div>
                        <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                          <div className="rounded-xl border border-white/10 bg-slate-950/55 px-3 py-2">
                            <span className={LABEL_CLASS_NAME}>
                              Rule preview
                            </span>
                            <p className="mt-1 truncate text-sm text-slate-200">
                              {getRuleSummary(activeRule.statement)}
                            </p>
                          </div>
                          <CompactField label="Target node">
                            <select
                              className={SELECT_CLASS_NAME}
                              onChange={(event) =>
                                updateRule(
                                  activeRule.conditionId,
                                  (currentRule) => ({
                                    ...currentRule,
                                    targetNodeId:
                                      event.target.value.length > 0
                                        ? event.target.value
                                        : null,
                                  }),
                                )
                              }
                              value={activeRule.targetNodeId ?? ""}
                            >
                              <option value="">Not connected</option>
                              {targetNodeOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </CompactField>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">
                      Unsupported rule content
                    </p>
                    <p className="text-sm text-slate-400">
                      This rule is preserved as-is, but it cannot be edited with
                      the current modal controls.
                    </p>
                    <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-xs text-slate-300">
                      {JSON.stringify(activeRule.statement, null, 2)}
                    </pre>
                    <label className="block space-y-1.5">
                      <span className={LABEL_CLASS_NAME}>Target node</span>
                      <select
                        className={SELECT_CLASS_NAME}
                        onChange={(event) =>
                          updateRule(activeRule.conditionId, (currentRule) => ({
                            ...currentRule,
                            targetNodeId:
                              event.target.value.length > 0
                                ? event.target.value
                                : null,
                          }))
                        }
                        value={activeRule.targetNodeId ?? ""}
                      >
                        <option value="">Not connected</option>
                        {targetNodeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const DecisionNodeModal = ({
  initialRuleConditionId,
  isOpen,
  nodeId,
  onClose,
}: DecisionNodeModalProps) => {
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);
  const updateGraph = useBuilderStore((state) => state.updateGraph);
  const stepElementsByNodeId = useFlowNodeContentStore(
    (state) => state.stepElementsByNodeId,
  );

  const node = useMemo(() => {
    if (!nodeId) {
      return null;
    }

    const candidate =
      nodes.find((graphNode) => graphNode.id === nodeId) ?? null;

    return candidate && isGraphDecisionNode(candidate) ? candidate : null;
  }, [nodeId, nodes]);

  const stepElementOptions = useMemo(
    () =>
      Object.entries(stepElementsByNodeId).flatMap(([stepNodeId, elements]) => {
        const stepNodeName =
          nodes.find((graphNode) => graphNode.id === stepNodeId)?.data.name ??
          "Step";

        return elements.flatMap((element) => {
          const referenceName = getElementReferenceName(element);

          if (!referenceName) {
            return [];
          }

          return [
            {
              id: element.id,
              label: formatElementReference(stepNodeName, referenceName),
            },
          ];
        });
      }),
    [nodes, stepElementsByNodeId],
  );

  const targetNodeOptions = useMemo(
    () =>
      nodes
        .filter((graphNode) => graphNode.id !== node?.id)
        .map((graphNode) => ({
          id: graphNode.id,
          label: `${graphNode.data.name} (${graphNode.type === "step" ? "Step" : "Decision"})`,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [node?.id, nodes],
  );

  const initialDraft = useMemo(
    () => (node ? getDecisionDraftFromNode(node, edges) : null),
    [edges, node],
  );

  const editorKey = useMemo(() => {
    if (!node || !initialDraft) {
      return null;
    }

    return `${node.id}:${initialRuleConditionId ?? ""}:${JSON.stringify(initialDraft)}`;
  }, [initialDraft, initialRuleConditionId, node]);

  if (!isOpen || !node || !initialDraft || !editorKey) {
    return null;
  }

  return (
    <DecisionNodeModalEditor
      initialDraft={initialDraft}
      initialRuleConditionId={initialRuleConditionId}
      isOpen={isOpen}
      key={editorKey}
      node={node}
      onClose={onClose}
      stepElementOptions={stepElementOptions}
      targetNodeOptions={targetNodeOptions}
      updateGraph={updateGraph}
    />
  );
};

export default DecisionNodeModal;
