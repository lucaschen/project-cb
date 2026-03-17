import type { StepElementDefinitionType } from "@app/api/flows";
import {
  useDraggable,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";

type StepElementPalettePanelProps = {
  definitions: StepElementDefinitionType[];
  isError: boolean;
  isLoading: boolean;
  onAdd: (elementId: string) => void;
};

type StepElementPalettePreviewCardProps = {
  definition: Pick<StepElementDefinitionType, "description" | "name">;
};

export const StepElementPalettePreviewCard = ({
  definition,
}: StepElementPalettePreviewCardProps) => (
  <>
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-white">{definition.name}</p>
      <Plus className="h-4 w-4 text-sky-200" />
    </div>
    <p className="mt-1 text-xs leading-5 text-slate-400">{definition.description}</p>
  </>
);

const StepElementPaletteItem = ({
  definition,
  onAdd,
}: {
  definition: StepElementDefinitionType;
  onAdd: (elementId: string) => void;
}) => {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    data: { type: "palette", elementId: definition.elementId },
    id: `palette:${definition.elementId}`,
  });

  return (
    <button
      className="w-full rounded-2xl border border-sky-300/20 bg-sky-300/8 px-3 py-3 text-left transition hover:border-sky-300/35 hover:bg-sky-300/12"
      onClick={() => onAdd(definition.elementId)}
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.55 : 1 }}
      type="button"
      {...attributes}
      {...listeners}
    >
      <StepElementPalettePreviewCard definition={definition} />
    </button>
  );
};

const StepElementPalettePanel = ({
  definitions,
  isError,
  isLoading,
  onAdd,
}: StepElementPalettePanelProps) => (
  <div className="flex min-h-0 flex-col border-r border-white/10 px-5 py-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
      Element palette
    </p>
    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              key={index}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm text-rose-100">
          Element definitions are unavailable right now.
        </div>
      ) : (
        <div className="space-y-3">
          {definitions.map((definition) => (
            <StepElementPaletteItem
              definition={definition}
              key={definition.elementId}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default StepElementPalettePanel;
