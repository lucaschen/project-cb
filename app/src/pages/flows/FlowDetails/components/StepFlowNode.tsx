import type { BuilderFlowNode } from "@app/utils/flowToReactFlow";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

const StepFlowNode = ({ data, selected }: NodeProps<BuilderFlowNode>) => {
  return (
    <div
      className={`min-w-44 rounded-2xl border px-3 py-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] ${
        selected
          ? "border-sky-300 bg-sky-300/15"
          : "border-white/10 bg-slate-950/90"
      }`}
    >
      <Handle position={Position.Left} type="target" />
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Step
        </p>
        <p className="text-sm font-semibold text-white">{data.name}</p>
        <p className="text-xs text-slate-400">
          {data.elementCount ?? 0} element
          {(data.elementCount ?? 0) === 1 ? "" : "s"}
        </p>
      </div>
      <Handle position={Position.Right} type="source" />
    </div>
  );
};

export default StepFlowNode;
