import type { BuilderFlowNode } from "@app/utils/flowToReactFlow";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

const DecisionFlowNode = ({ data, selected }: NodeProps<BuilderFlowNode>) => {
  return (
    <div
      className={`min-w-48 rounded-2xl border px-3 py-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] ${
        selected
          ? "border-amber-300 bg-amber-300/15"
          : "border-white/10 bg-slate-900/95"
      }`}
    >
      <Handle position={Position.Left} type="target" />
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Decision
        </p>
        <p className="text-sm font-semibold text-white">{data.name}</p>
        <p className="text-xs text-slate-400">
          {data.conditionCount ?? 0} rule
          {(data.conditionCount ?? 0) === 1 ? "" : "s"}
        </p>
      </div>
      <Handle position={Position.Right} type="source" />
    </div>
  );
};

export default DecisionFlowNode;
