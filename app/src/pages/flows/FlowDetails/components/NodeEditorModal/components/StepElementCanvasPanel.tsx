import StepElementRenderer from "@app/components/StepElementRenderer";
import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Fragment,
  type KeyboardEventHandler,
  type ReactNode,
  useRef,
} from "react";

import { getInsertionZoneId } from "../stepEditorDnd";
import type { StepElementDraft } from "../stepEditorTypes";
import {
  findElementByReferenceName,
  formatElementReference,
  getElementPropertyValue,
  getElementReferenceName,
} from "../stepElementReferences";

type StepElementCanvasPanelProps = {
  draftElements: StepElementDraft[];
  onCanvasKeyDown: KeyboardEventHandler<HTMLDivElement>;
  previewInsertionIndex: number | null;
  selectedElementId: string | null;
  stepName: string;
  onSelect: (elementId: string) => void;
};

type StepDraftElementCardProps = {
  draftElements: StepElementDraft[];
  element: StepElementDraft;
  isActive: boolean;
  stepName: string;
};

const STEP_EDITOR_CANVAS_ID = "step-editor-canvas";

export const StepDraftElementCard = ({
  draftElements,
  element,
  isActive,
  stepName,
}: StepDraftElementCardProps) => {
  const referenceName = getElementReferenceName(element);
  const reference = referenceName ? formatElementReference(stepName, referenceName) : null;
  const htmlForValue = getElementPropertyValue(element, "htmlFor").trim();
  const htmlForTarget = htmlForValue
    ? findElementByReferenceName(draftElements, htmlForValue)
    : null;
  const htmlForReference = htmlForTarget
    ? formatElementReference(stepName, htmlForValue)
    : null;
  const unresolvedHtmlForValue =
    htmlForValue.length > 0 && !htmlForTarget ? htmlForValue : null;

  return (
    <div
      className={`overflow-hidden rounded-[24px] border transition ${
        isActive
          ? "border-sky-300/35 bg-sky-300/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          element: <span className="text-slate-200">{element.elementId}</span>
        </p>
        {htmlForReference ? (
          <p className="mt-1 text-xs text-slate-500">
            htmlFor: <span className="text-slate-300">{htmlForReference}</span>
          </p>
        ) : unresolvedHtmlForValue ? (
          <p className="mt-1 text-xs text-slate-500">
            htmlFor:{" "}
            <span className="text-amber-200">
              unresolved ({unresolvedHtmlForValue})
            </span>
          </p>
        ) : null}
        {reference ? (
          <p className="mt-1 text-xs text-slate-500">
            reference: <span className="text-slate-300">{reference}</span>
          </p>
        ) : null}
      </div>
      <div className="pointer-events-none p-4">
        <StepElementRenderer element={element} />
      </div>
    </div>
  );
};

const DraggableStepElement = ({
  draftElements,
  element,
  isActive,
  onSelect,
  stepName,
}: {
  element: StepElementDraft;
  isActive: boolean;
  onSelect: (elementId: string) => void;
  draftElements: StepElementDraft[];
  stepName: string;
}) => {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    data: { type: "draft-element", elementId: element.id },
    id: element.id,
  });

  return (
    <div
      className="cursor-grab active:cursor-grabbing"
      onClick={() => onSelect(element.id)}
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.45 : 1 }}
      {...attributes}
      {...listeners}
    >
      <StepDraftElementCard
        draftElements={draftElements}
        element={element}
        isActive={isActive}
        stepName={stepName}
      />
    </div>
  );
};

const StepCanvasDropArea = ({
  children,
  isActiveDropArea,
  onKeyDown,
}: {
  children: ReactNode;
  isActiveDropArea: boolean;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}) => {
  const { setNodeRef } = useDroppable({
    data: { type: "canvas-root" },
    id: STEP_EDITOR_CANVAS_ID,
  });
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      aria-label="Step editor canvas"
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[24px] border border-dashed p-4 ${
        isActiveDropArea
          ? "border-sky-300/50 bg-sky-300/8"
          : "border-white/10 bg-white/5"
      }`}
      onKeyDown={onKeyDown}
      onMouseDownCapture={(event) => {
        const target = event.target as HTMLElement | null;

        if (
          target?.closest(
            "a, button, input, select, textarea, [contenteditable='true']",
          )
        ) {
          return;
        }

        dropAreaRef.current?.focus();
      }}
      ref={(node) => {
        setNodeRef(node);
        dropAreaRef.current = node;
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

const StepCanvasInsertionZone = ({
  index,
  isEmpty,
  isPreviewVisible,
}: {
  index: number;
  isEmpty?: boolean;
  isPreviewVisible: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    data: { index, type: "insertion-zone" },
    id: getInsertionZoneId(index),
  });

  if (isEmpty) {
    return (
      <div
        className={`flex min-h-[240px] flex-1 items-center justify-center rounded-2xl border px-4 py-10 text-center text-sm transition ${
          isPreviewVisible
            ? "border-sky-300/45 bg-sky-300/10 text-sky-100"
            : "border-white/10 bg-white/5 text-slate-400"
        }`}
        ref={setNodeRef}
      >
        <div className="space-y-2">
          <div className="text-sm font-medium text-white">
            Drag elements from the palette into this step.
          </div>
          <div className="text-xs leading-5 text-slate-400">
            Drop in the middle panel to create the first element.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-5 shrink-0" ref={setNodeRef}>
      {isPreviewVisible ? (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-0.5 rounded-full bg-sky-300 shadow-[0_0_0_1px_rgba(125,211,252,0.18)]" />
        </div>
      ) : null}
    </div>
  );
};

const StepElementCanvasPanel = ({
  draftElements,
  onCanvasKeyDown,
  onSelect,
  previewInsertionIndex,
  selectedElementId,
  stepName,
}: StepElementCanvasPanelProps) => (
  <div className="flex min-h-0 flex-col px-5 py-5">
    <StepCanvasDropArea
      isActiveDropArea={previewInsertionIndex !== null}
      onKeyDown={onCanvasKeyDown}
    >
      {draftElements.length === 0 ? (
        <StepCanvasInsertionZone
          index={0}
          isEmpty
          isPreviewVisible={previewInsertionIndex === 0}
        />
      ) : (
        <div className="min-h-full">
          <StepCanvasInsertionZone
            index={0}
            isPreviewVisible={previewInsertionIndex === 0}
          />
          {draftElements.map((element, index) => (
            <Fragment key={element.id}>
              <DraggableStepElement
                draftElements={draftElements}
                element={element}
                isActive={selectedElementId === element.id}
                onSelect={onSelect}
                stepName={stepName}
              />
              <StepCanvasInsertionZone
                index={index + 1}
                isPreviewVisible={previewInsertionIndex === index + 1}
              />
            </Fragment>
          ))}
        </div>
      )}
    </StepCanvasDropArea>
  </div>
);

export default StepElementCanvasPanel;
