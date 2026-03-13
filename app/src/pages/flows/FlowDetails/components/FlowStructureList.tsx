import { Button } from "@app/components/ui/Button";
import type { FlowNodeType } from "@packages/shared/http/schemas/flows/common";

type FlowStructureListProps = {
  nodes: FlowNodeType[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
};

const FlowStructureList = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}: FlowStructureListProps) => {
  const { stepNodes, decisionNodes } = nodes.reduce<{
    stepNodes: FlowNodeType[];
    decisionNodes: FlowNodeType[];
  }>(
    (acc, node) => {
      if (node.type === "STEP") {
        acc.stepNodes.push(node);
      } else if (node.type === "DECISION") {
        acc.decisionNodes.push(node);
      }
      return acc;
    },
    { stepNodes: [], decisionNodes: [] },
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Structure</h3>
        <p className="text-sm text-slate-400">Current nodes in this flow.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Steps
          </p>
          {stepNodes.length === 0 ? (
            <p className="text-sm text-slate-500">No step nodes yet.</p>
          ) : (
            <div className="space-y-2">
              {stepNodes.map((node) => (
                <Button
                  className="w-full justify-start px-3 py-2 text-left text-sm"
                  key={node.nodeId}
                  onClick={() => onSelectNode(node.nodeId)}
                  variant={
                    selectedNodeId === node.nodeId ? "primary" : "secondary"
                  }
                >
                  {node.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Decisions
          </p>
          {decisionNodes.length === 0 ? (
            <p className="text-sm text-slate-500">No decision nodes yet.</p>
          ) : (
            <div className="space-y-2">
              {decisionNodes.map((node) => (
                <Button
                  className="w-full justify-start px-3 py-2 text-left text-sm"
                  key={node.nodeId}
                  onClick={() => onSelectNode(node.nodeId)}
                  variant={
                    selectedNodeId === node.nodeId ? "primary" : "secondary"
                  }
                >
                  {node.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowStructureList;
