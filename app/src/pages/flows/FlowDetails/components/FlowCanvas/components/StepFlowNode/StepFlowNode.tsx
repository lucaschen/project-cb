import type { GraphStepNode } from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

const handleStyle = {
  height: 18,
  width: 18,
};

const StepFlowNode = ({ data, selected }: NodeProps<GraphStepNode>) => {
  const elementCount: number = 0; // fetch from store
  return (
    <div
      className={`min-w-44 rounded-2xl border px-3 py-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] ${
        selected
          ? "border-sky-300 bg-sky-300/15"
          : "border-white/10 bg-slate-950/90"
      }`}
    >
      <Handle
        className="!border-[3px] !border-slate-950 !bg-sky-300 !shadow-[0_0_0_6px_rgba(56,189,248,0.18)]"
        position={Position.Left}
        style={handleStyle}
        type="target"
      />
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Step
        </p>
        <p className="text-sm font-semibold text-white">{data.name}</p>
        <p className="text-xs text-slate-400">
          {elementCount} element
          {elementCount === 1 ? "" : "s"}
        </p>
      </div>
      <Handle
        className="!border-[3px] !border-slate-950 !bg-sky-300 !shadow-[0_0_0_6px_rgba(56,189,248,0.18)]"
        position={Position.Right}
        style={handleStyle}
        type="source"
      />
    </div>
  );
};

export default StepFlowNode;
