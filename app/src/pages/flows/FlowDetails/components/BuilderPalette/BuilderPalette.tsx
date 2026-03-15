import { Card } from "@app/components/ui/Card";
import { NodeType } from "@packages/shared/types/enums";

export const BUILDER_NODE_KIND = "application/project-cb-builder-node";

type BuilderNodeKind = "decision" | "step";

const paletteItems: {
  description: string;
  title: string;
  graphNodeType: BuilderNodeKind;
  nodeType: NodeType;
}[] = [
  {
    description: "Drag into the canvas to add a new step and wire it later.",
    graphNodeType: "step",
    nodeType: NodeType.STEP,
    title: "Step",
  },
  {
    description:
      "Drag into the canvas to add a decision once a valid fallback target exists.",
    graphNodeType: "decision",
    nodeType: NodeType.DECISION,
    title: "Decision",
  },
];

type BuilderPaletteProps = {
  isOpen: boolean;
};

const BuilderPalette = ({ isOpen }: BuilderPaletteProps) => {
  return (
    <aside className={`h-full min-h-0 w-full ${isOpen ? "block" : "hidden"}`}>
      <Card className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto rounded-[24px] border-white/10 bg-slate-950/85 p-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Palette
          </p>
          <p className="text-sm leading-5 text-slate-400">
            Drag quick-add tiles into the canvas.
          </p>
        </div>
        <div className="space-y-2.5">
          {paletteItems.map((item) => {
            const isDisabled = false;

            return (
              <div
                className={`rounded-[20px] border border-dashed px-3 py-3 ${
                  isDisabled
                    ? "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
                    : item.nodeType === NodeType.DECISION
                      ? "cursor-grab border-fuchsia-300/30 bg-fuchsia-300/8"
                      : "cursor-grab border-sky-300/30 bg-sky-300/8"
                }`}
                draggable={!isDisabled}
                key={item.title}
                onDragStart={(event) => {
                  if (isDisabled) {
                    event.preventDefault();
                    return;
                  }

                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData(
                    BUILDER_NODE_KIND,
                    item.graphNodeType,
                  );
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Drag
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {isDisabled
                    ? "Add another node first so this decision has a valid fallback target."
                    : item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </aside>
  );
};

export default BuilderPalette;
