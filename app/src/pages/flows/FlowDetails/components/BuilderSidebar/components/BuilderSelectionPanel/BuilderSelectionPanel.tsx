import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FlowGraphDecisionNodeEntity from "@packages/shared/entities/FlowGraphDecisionNodeEntity/FlowGraphDecisionNodeEntity";
import type { GraphDecisionNode } from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import { useMemo } from "react";

import useBuilderStore from "../../../../store/builderStore";
import {
  isDecisionFallbackEdge,
  isDecisionRuleEdge,
  isDefaultEdge,
  isGraphDecisionNode,
  isGraphStepNode,
} from "../../../../utils/builderFlowToReactFlow";
import { formatComparisonStatement } from "@packages/shared/entities/FlowGraphDecisionNodeEntity/utils/graphDecisionNode";

type BuilderSelectionPanelProps = {
  onOpenDecisionEditor: (nodeId: string, conditionId?: string | null) => void;
  onOpenStepEditor: (nodeId: string) => void;
};

const SectionEyebrow = ({ children }: { children: string }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
    {children}
  </p>
);

const PanelHeader = ({ title, detail }: { title: string; detail?: string }) => (
  <div className="space-y-1">
    <SectionEyebrow>{title}</SectionEyebrow>
    {detail ? (
      <p className="text-sm leading-5 text-slate-400">{detail}</p>
    ) : null}
  </div>
);

const RulePreviewRow = ({
  color,
  isDragging,
  onClick,
  rule,
}: {
  color: string;
  isDragging?: boolean;
  onClick: () => void;
  rule: GraphDecisionNode["data"]["rules"][number];
}) => (
  <button
    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left ${
      isDragging
        ? "border-fuchsia-300/40 bg-fuchsia-300/12"
        : "border-white/10 bg-white/5 hover:border-fuchsia-300/20 hover:bg-white/[0.08]"
    }`}
    onClick={onClick}
    type="button"
  >
    <span
      className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="min-w-0 text-sm text-slate-200">
      {formatComparisonStatement(rule.statement)}
    </span>
  </button>
);

const SortableRulePreviewRow = ({
  color,
  onClick,
  rule,
}: {
  color: string;
  onClick: () => void;
  rule: GraphDecisionNode["data"]["rules"][number];
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.conditionId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <RulePreviewRow
        color={color}
        isDragging={isDragging}
        onClick={onClick}
        rule={rule}
      />
    </div>
  );
};

const RULE_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#84cc16"];

const BuilderSelectionPanel = ({
  onOpenDecisionEditor,
  onOpenStepEditor,
}: BuilderSelectionPanelProps) => {
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);
  const selectedItem = useBuilderStore((state) => state.selectedItem);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const updateGraph = useBuilderStore((state) => state.updateGraph);
  const sensors = useSensors(useSensor(PointerSensor));

  const selectedNode =
    selectedItem?.kind === "node"
      ? (nodes.find((node) => node.id === selectedItem.id) ?? null)
      : null;
  const selectedEdge =
    selectedItem?.kind === "edge"
      ? (edges.find((edge) => edge.id === selectedItem.id) ?? null)
      : null;

  const targetOptions = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        label: `${node.data.name} (${node.type === "step" ? "Step" : "Decision"})`,
      })),
    [nodes],
  );

  if (selectedNode) {
    const elementCount: number = 0; // fetch from store
    if (isGraphStepNode(selectedNode)) {
      const nextEdge = edges.find(
        (candidate) =>
          candidate.source === selectedNode.id && isDefaultEdge(candidate),
      );

      return (
        <div className="space-y-3">
          <PanelHeader
            detail={`${elementCount} step element${
              elementCount === 1 ? "" : "s"
            }`}
            title="Step"
          />
          <FormField
            id="selected-step-name"
            label="Name"
            onChange={(event) =>
              updateGraph((graph) => {
                const node = graph.getNodeById(selectedNode.id);

                if (!node || !isGraphStepNode(node)) {
                  return;
                }

                node.data.name = event.target.value;
              })
            }
            value={selectedNode.data.name}
          />
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Next node
            </span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
              onChange={(event) =>
                updateGraph((graph) => {
                  graph.setConnection({
                    sourceNodeId: selectedNode.id,
                    targetNodeId:
                      event.target.value === "__NONE__"
                        ? null
                        : event.target.value,
                  });
                })
              }
              value={nextEdge?.target ?? "__NONE__"}
            >
              <option value="__NONE__">Not connected</option>
              {targetOptions
                .filter((option) => option.id !== selectedNode.id)
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
            </select>
          </label>
          <Button
            className="w-full"
            onClick={() => onOpenStepEditor(selectedNode.id)}
          >
            Open step editor
          </Button>
          <Button
            className="w-full"
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

    if (isGraphDecisionNode(selectedNode)) {
      const fallbackEdge = edges.find(
        (candidate) =>
          candidate.source === selectedNode.id &&
          isDecisionFallbackEdge(candidate),
      );
      const decisionRuleIds = selectedNode.data.rules.map(
        (rule) => rule.conditionId,
      );

      return (
        <div className="space-y-3">
          <PanelHeader
            detail={`${selectedNode.data.rules.length} preview rule${
              selectedNode.data.rules.length === 1 ? "" : "s"
            }`}
            title="Decision"
          />
          <FormField
            id="selected-decision-name"
            label="Name"
            onChange={(event) =>
              updateGraph((graph) => {
                const node = graph.getNodeById(selectedNode.id);

                if (!node || !isGraphDecisionNode(node)) {
                  return;
                }

                node.data.name = event.target.value;
              })
            }
            value={selectedNode.data.name}
          />
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Fallback target
            </span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300"
              onChange={(event) =>
                updateGraph((graph) => {
                  graph.setConnection({
                    sourceNodeId: selectedNode.id,
                    targetNodeId:
                      event.target.value.length > 0 ? event.target.value : null,
                  });
                })
              }
              value={fallbackEdge?.target ?? ""}
            >
              <option value="">No fallback selected</option>
              {targetOptions
                .filter((option) => option.id !== selectedNode.id)
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
            </select>
          </label>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionEyebrow>Rules</SectionEyebrow>
                <p className="text-sm text-slate-400">
                  Drag to reorder. Click to edit in the decision modal.
                </p>
              </div>
              <Button
                className="h-8 px-3 text-xs"
                onClick={() => onOpenDecisionEditor(selectedNode.id)}
                variant="secondary"
              >
                Open editor
              </Button>
            </div>
            {selectedNode.data.rules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-400">
                No rules yet. Open the editor to add one.
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;

                  if (!over || active.id === over.id) {
                    return;
                  }

                  updateGraph((graph) => {
                    const node = graph.getNodeById(selectedNode.id);

                    if (!(node instanceof FlowGraphDecisionNodeEntity)) {
                      return;
                    }

                    const targetIndex = selectedNode.data.rules.findIndex(
                      (rule) => rule.conditionId === over.id,
                    );

                    node.moveRuleToIndex(String(active.id), targetIndex);
                  });
                }}
                sensors={sensors}
              >
                <SortableContext
                  items={decisionRuleIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedNode.data.rules.map((rule, index) => (
                      <SortableRulePreviewRow
                        color={RULE_COLORS[index % RULE_COLORS.length]}
                        key={rule.conditionId}
                        onClick={() =>
                          onOpenDecisionEditor(
                            selectedNode.id,
                            rule.conditionId,
                          )
                        }
                        rule={rule}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
          <Button
            className="w-full"
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
