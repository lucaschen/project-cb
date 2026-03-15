import type {
  FlowGraphEdge,
  GraphDecisionRuleEdgeData,
} from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import type { EdgeProps } from "@xyflow/react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";

const DECISION_RULE_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#84cc16"];

const getDecisionRuleColor = (
  edgeData: GraphDecisionRuleEdgeData,
  selected: boolean,
) => {
  const baseColor =
    DECISION_RULE_COLORS[edgeData.conditionOrder % DECISION_RULE_COLORS.length];

  if (!selected) {
    return baseColor;
  }

  return "#ffffff";
};

const getStrokeColor = (edgeData: FlowGraphEdge["data"], selected: boolean) => {
  if (edgeData.type === "fallback") {
    return selected ? "#fbbf24" : "#f59e0b";
  }

  if (edgeData.type === "decision") {
    return getDecisionRuleColor(edgeData, selected);
  }

  return selected ? "#7dd3fc" : "#38bdf8";
};

const BuilderGraphEdge = ({
  data,
  id,
  label,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<FlowGraphEdge>) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    borderRadius: 18,
    offset: 28,
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });
  const stroke = getStrokeColor(data, selected ?? false);

  return (
    <>
      <BaseEdge
        id={id}
        interactionWidth={42}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          stroke,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: selected ? 4.5 : 3.25,
        }}
      />
      {data.type === "decision" && label ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] shadow-[0_12px_30px_rgba(15,23,42,0.35)] animate-[pulse_2.8s_ease-in-out_infinite]"
            style={{
              backgroundColor: "rgba(2, 6, 23, 0.92)",
              borderColor: `${stroke}55`,
              color: stroke,
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};

export default BuilderGraphEdge;
