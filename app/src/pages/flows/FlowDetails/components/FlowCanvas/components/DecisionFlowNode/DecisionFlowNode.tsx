import type { NodeProps } from "@xyflow/react";
import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

import {
  type BuilderDecisionNode,
  DECISION_FALLBACK_SOURCE_HANDLE_ID,
  formatComparisonStatement,
  getDecisionRuleSourceHandleId,
} from "../../../../utils/builderFlowToReactFlow";

const handleStyle = {
  height: 18,
  width: 18,
};

const RULE_COLORS = ["#22d3ee", "#a855f7", "#f97316", "#84cc16"];

const DecisionFlowNode = ({
  id,
  data,
  selected,
}: NodeProps<BuilderDecisionNode>) => {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.rules.length, id, updateNodeInternals]);

  return (
    <div
      className={`relative min-w-[300px] max-w-[360px] rounded-[26px] border px-4 py-3.5 shadow-[0_24px_48px_rgba(15,23,42,0.22)] ${
        selected
          ? "border-amber-300 bg-amber-300/15"
          : "border-white/10 bg-slate-900/95"
      }`}
    >
      <Handle
        className="!z-20 !border-[3px] !border-slate-950 !bg-amber-300 !shadow-[0_0_0_6px_rgba(251,191,36,0.18)]"
        position={Position.Left}
        style={handleStyle}
        type="target"
      />
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Decision
          </p>
          <p className="text-base font-semibold text-white">{data.name}</p>
          <p className="text-xs text-slate-400">
            {data.rules.length} branching rule
            {data.rules.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="space-y-2">
          {data.rules.length > 0 ? (
            data.rules.map((rule, index) => (
              <div
                className="relative rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-200"
                key={rule.conditionId}
              >
                <Handle
                  className="!z-20 !border-[3px] !border-slate-950 !shadow-[0_0_0_6px_rgba(15,23,42,0.4)]"
                  id={getDecisionRuleSourceHandleId(rule.conditionId)}
                  position={Position.Right}
                  style={{
                    ...handleStyle,
                    backgroundColor: RULE_COLORS[index % RULE_COLORS.length],
                    right: -9,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  type="source"
                />
                <div className="flex items-start gap-2 pr-8">
                  <span
                    className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: RULE_COLORS[index % RULE_COLORS.length],
                    }}
                  />
                  <span>{formatComparisonStatement(rule.statement)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
              Add rules to branch this decision.
            </div>
          )}
        </div>
        <div className="relative rounded-2xl border border-amber-300/15 bg-amber-300/8 px-3 py-2">
          <Handle
            className="!z-20 !border-[3px] !border-slate-950 !bg-amber-300 !shadow-[0_0_0_6px_rgba(251,191,36,0.18)]"
            id={DECISION_FALLBACK_SOURCE_HANDLE_ID}
            position={Position.Right}
            style={{
              ...handleStyle,
              right: -9,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            type="source"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Fallback
          </p>
          <p className="mt-1 pr-8 text-xs text-slate-300">
            Default branch when no rule matches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecisionFlowNode;
