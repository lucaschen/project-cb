import { fetchStepElements, updateStepElements } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import Modal from "@app/components/ui/Modal";
import useToast from "@app/components/ui/useToast";
import useFlowNodeContentStore from "@app/pages/flows/FlowDetails/store/flowNodeContentStore";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  HydratedStepElementType,
  StepElementPropertyType,
} from "@packages/shared/http/schemas/flows/steps/elements/common";
import { ElementPropertyTypes } from "@packages/shared/types/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";

import useStepElementDefinitions, {
  createHydratedStepElementFromDefinition,
} from "../../hooks/useStepElementDefinitions";
import useBuilderStore from "../../store/builderStore";
import { isGraphStepNode } from "../../utils/builderFlowToReactFlow";
import StepElementCanvasPanel, {
  StepDraftElementCard,
} from "./components/StepElementCanvasPanel";
import StepElementPalettePanel, {
  StepElementPalettePreviewCard,
} from "./components/StepElementPalettePanel";
import StepElementPropertiesPanel from "./components/StepElementPropertiesPanel";
import { getInsertionIndex } from "./stepEditorDnd";
import type { StepElementDraft } from "./stepEditorTypes";
import {
  formatElementReference,
  getElementReferenceName,
} from "./stepElementReferences";

type StepNodeModalProps = {
  flowId: string;
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
  organizationId: string;
};

type ActiveStepDrag =
  | {
      elementId: string;
      type: "draft-element";
    }
  | {
      elementId: string;
      type: "palette";
    }
  | null;

const toDraftElements = (
  elements: HydratedStepElementType[],
): StepElementDraft[] =>
  elements
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((element, index) => ({
      ...element,
      order: index,
      properties: element.properties.map((property) => ({ ...property })),
    }));

const serializePropertyValue = (
  value: string,
  propertyType: ElementPropertyTypes,
): StepElementPropertyType["value"] => {
  switch (propertyType) {
    case ElementPropertyTypes.STRING:
      return value;
    case ElementPropertyTypes.NUMBER:
      return Number(value);
    case ElementPropertyTypes.BOOLEAN:
      return value === "true";
    case ElementPropertyTypes.ARRAY:
    case ElementPropertyTypes.OBJECT:
      return JSON.parse(value);
    default:
      return value;
  }
};

const validateStepDraft = (elements: StepElementDraft[]) => {
  const errors: string[] = [];

  elements.forEach((element, index) => {
    const elementLabel = `Element ${index + 1} (${element.elementId})`;

    element.properties.forEach((property) => {
      if (
        property.required &&
        property.propertyType !== ElementPropertyTypes.BOOLEAN &&
        property.value.trim().length === 0
      ) {
        errors.push(`${elementLabel} needs ${property.propertyName}.`);
        return;
      }

      if (property.value.trim().length === 0) {
        return;
      }

      try {
        serializePropertyValue(property.value, property.propertyType);
      } catch {
        errors.push(
          `${elementLabel} has an invalid ${property.propertyName} value.`,
        );
      }
    });
  });

  return errors;
};

const normalizeDraftElements = (elements: StepElementDraft[]) =>
  elements.map((element, index) => ({
    ...element,
    order: index,
  }));

const getNextSelectionAfterRemoval = (
  elements: StepElementDraft[],
  removedIndex: number,
) => {
  if (elements.length === 0) {
    return null;
  }

  return elements[Math.min(removedIndex, elements.length - 1)]?.id ?? null;
};

const insertDraftElement = (
  currentElements: StepElementDraft[],
  element: StepElementDraft,
  targetIndex: number,
) => {
  const boundedIndex = Math.max(
    0,
    Math.min(targetIndex, currentElements.length),
  );
  const nextElements = currentElements.slice();

  nextElements.splice(boundedIndex, 0, element);

  return normalizeDraftElements(nextElements);
};

const moveDraftElement = (
  currentElements: StepElementDraft[],
  elementId: string,
  targetIndex: number,
) => {
  const oldIndex = currentElements.findIndex(
    (element) => element.id === elementId,
  );

  if (oldIndex === -1) {
    return currentElements;
  }

  const boundedIndex = Math.max(
    0,
    Math.min(targetIndex, currentElements.length),
  );
  const adjustedIndex =
    boundedIndex > oldIndex ? boundedIndex - 1 : boundedIndex;
  const nextElements = currentElements.slice();
  const [movedElement] = nextElements.splice(oldIndex, 1);

  if (!movedElement) {
    return currentElements;
  }

  nextElements.splice(adjustedIndex, 0, movedElement);

  return normalizeDraftElements(nextElements);
};

const stepEditorCollisionDetection: CollisionDetection = (args) => {
  const canvasContainers = args.droppableContainers.filter(
    (container) => container.data.current?.type === "canvas-root",
  );
  const pointerInCanvas = pointerWithin({
    ...args,
    droppableContainers: canvasContainers,
  });

  if (pointerInCanvas.length === 0) {
    return [];
  }

  const insertionZoneContainers = args.droppableContainers.filter(
    (container) => container.data.current?.type === "insertion-zone",
  );
  const pointerInInsertionZone = pointerWithin({
    ...args,
    droppableContainers: insertionZoneContainers,
  });

  if (pointerInInsertionZone.length > 0) {
    return pointerInInsertionZone;
  }

  return closestCenter({
    ...args,
    droppableContainers: insertionZoneContainers,
  });
};

const StepNodeModal = ({
  flowId,
  isOpen,
  nodeId,
  onClose,
  organizationId,
}: StepNodeModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const nodes = useBuilderStore((state) => state.nodes);
  const updateGraph = useBuilderStore((state) => state.updateGraph);
  const stepElementsByNodeId = useFlowNodeContentStore(
    (state) => state.stepElementsByNodeId,
  );
  const setStepElements = useFlowNodeContentStore(
    (state) => state.setStepElements,
  );
  const [draftElements, setDraftElements] = useState<StepElementDraft[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [activeDrag, setActiveDrag] = useState<ActiveStepDrag>(null);
  const [previewInsertionIndex, setPreviewInsertionIndex] = useState<
    number | null
  >(null);

  const node = useMemo(() => {
    if (!nodeId) {
      return null;
    }

    const candidate =
      nodes.find((graphNode) => graphNode.id === nodeId) ?? null;

    return candidate && isGraphStepNode(candidate) ? candidate : null;
  }, [nodeId, nodes]);

  const stepElementsQuery = useQuery({
    enabled: isOpen && Boolean(nodeId),
    queryFn: () => fetchStepElements({ flowId, stepId: nodeId! }),
    queryKey: nodeId
      ? queryKeys.flowStepElements(flowId, nodeId)
      : ["step-elements", "missing"],
    staleTime: Infinity,
  });

  const stepElementDefinitionsQuery = useStepElementDefinitions(organizationId);
  console.log(stepElementDefinitionsQuery.error);
  const definitionsById = useMemo(
    () =>
      new Map(
        (stepElementDefinitionsQuery.data ?? []).map((definition) => [
          definition.elementId,
          definition,
        ]),
      ),
    [stepElementDefinitionsQuery.data],
  );

  useEffect(() => {
    if (!nodeId || !isOpen) {
      setDraftElements([]);
      setSelectedElementId(null);
      setActiveDrag(null);
      setPreviewInsertionIndex(null);
      return;
    }

    const baselineElements =
      stepElementsQuery.data ?? stepElementsByNodeId[nodeId] ?? [];
    const nextDraft = toDraftElements(baselineElements);

    setDraftElements(nextDraft);
    setSelectedElementId(nextDraft[0]?.id ?? null);
  }, [isOpen, nodeId, stepElementsByNodeId, stepElementsQuery.data]);

  const selectedElement = useMemo(
    () =>
      draftElements.find((element) => element.id === selectedElementId) ??
      draftElements[0] ??
      null,
    [draftElements, selectedElementId],
  );

  const validationErrors = useMemo(
    () => validateStepDraft(draftElements),
    [draftElements],
  );

  const htmlForOptions = useMemo(() => {
    if (!selectedElement) {
      return [];
    }

    return draftElements
      .filter((element) => element.id !== selectedElement.id)
      .map((element) => {
        const referenceName = getElementReferenceName(element);

        if (!referenceName) {
          return null;
        }

        return {
          label: formatElementReference(
            node?.data.name ?? "step",
            referenceName,
          ),
          value: referenceName,
        };
      })
      .filter(
        (option): option is { label: string; value: string } => option !== null,
      );
  }, [draftElements, node?.data.name, selectedElement]);

  const isDirty = useMemo(() => {
    if (!nodeId) {
      return false;
    }

    const baseline = toDraftElements(
      stepElementsQuery.data ?? stepElementsByNodeId[nodeId] ?? [],
    );

    return JSON.stringify(baseline) !== JSON.stringify(draftElements);
  }, [draftElements, nodeId, stepElementsByNodeId, stepElementsQuery.data]);

  const updateStepElementsMutation = useMutation({
    mutationFn: updateStepElements,
    onSuccess: (elements) => {
      if (!nodeId) {
        return;
      }

      queryClient.setQueryData(
        queryKeys.flowStepElements(flowId, nodeId),
        elements,
      );
      setStepElements(nodeId, elements);
      updateGraph((graph) => {
        const graphNode = graph.getNodeById(nodeId);

        if (!graphNode || !isGraphStepNode(graphNode)) {
          return;
        }

        // TODO update element count through store
        // graphNode.data.elementCount = elements.length;
      });
      toast.success("Step elements saved.");
      onClose();
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, {
          default: "Unable to save step elements right now. Try again.",
        }),
      );
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const addElement = (
    elementId: string,
    targetIndex = draftElements.length,
  ) => {
    const definition = definitionsById.get(elementId);

    if (!definition) {
      return;
    }

    const createdElement = createHydratedStepElementFromDefinition(definition);

    setDraftElements((currentElements) => {
      const nextElements = insertDraftElement(
        currentElements,
        {
          ...createdElement,
          order: targetIndex,
        },
        targetIndex,
      );

      setSelectedElementId(createdElement.id);
      return nextElements;
    });
  };

  const clearDragState = () => {
    setActiveDrag(null);
    setPreviewInsertionIndex(null);
  };

  const removeDraftElementById = (elementId: string) => {
    setDraftElements((currentElements) => {
      const removedIndex = currentElements.findIndex(
        (element) => element.id === elementId,
      );

      if (removedIndex === -1) {
        return currentElements;
      }

      const nextElements = normalizeDraftElements(
        currentElements.filter((element) => element.id !== elementId),
      );

      setSelectedElementId(
        getNextSelectionAfterRemoval(nextElements, removedIndex),
      );

      return nextElements;
    });
  };

  const moveSelection = (direction: "down" | "up") => {
    if (!selectedElement) {
      return;
    }

    const currentIndex = draftElements.findIndex(
      (element) => element.id === selectedElement.id,
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      direction === "up"
        ? Math.max(0, currentIndex - 1)
        : Math.min(draftElements.length - 1, currentIndex + 1);

    if (nextIndex === currentIndex) {
      return;
    }

    setSelectedElementId(draftElements[nextIndex]?.id ?? selectedElement.id);
  };

  const updateSelectedElement = (
    updater: (element: StepElementDraft) => StepElementDraft,
  ) => {
    if (!selectedElement) {
      return;
    }

    setDraftElements((currentElements) =>
      currentElements.map((element) =>
        element.id === selectedElement.id ? updater(element) : element,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const dragType = event.active.data.current?.type;

    if (dragType === "palette") {
      setActiveDrag({
        elementId: String(event.active.data.current?.elementId),
        type: "palette",
      });
      return;
    }

    if (dragType === "draft-element") {
      setActiveDrag({
        elementId: String(event.active.data.current?.elementId),
        type: "draft-element",
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const nextInsertionIndex = getInsertionIndex(event.over?.id);

    setPreviewInsertionIndex((currentIndex) =>
      currentIndex === nextInsertionIndex ? currentIndex : nextInsertionIndex,
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const insertionIndex = getInsertionIndex(event.over?.id);

    if (insertionIndex === null) {
      clearDragState();
      return;
    }

    if (event.active.data.current?.type === "palette") {
      addElement(String(event.active.data.current.elementId), insertionIndex);
      clearDragState();
      return;
    }

    setDraftElements((currentElements) =>
      moveDraftElement(
        currentElements,
        String(event.active.id),
        insertionIndex,
      ),
    );

    clearDragState();
  };

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedElement) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (
      target &&
      target !== event.currentTarget &&
      target.closest(
        "a, button, input, select, textarea, [contenteditable='true']",
      )
    ) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection("up");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection("down");
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeDraftElementById(selectedElement.id);
    }
  };

  const saveDraft = async () => {
    if (!nodeId || validationErrors.length > 0) {
      return;
    }

    await updateStepElementsMutation.mutateAsync({
      flowId,
      input: {
        elements: draftElements.map((element) => ({
          elementId: element.elementId,
          id: element.id,
          name: element.id,
          properties: element.properties
            .filter(
              (property) =>
                property.value.trim().length > 0 || property.required,
            )
            .map((property) => ({
              propertyId: property.propertyId,
              value: serializePropertyValue(
                property.value,
                property.propertyType,
              ),
            })),
        })),
      },
      stepId: nodeId,
    });
  };

  const overlayPaletteItem = useMemo(() => {
    if (activeDrag?.type !== "palette") {
      return null;
    }

    return definitionsById.get(activeDrag.elementId) ?? null;
  }, [activeDrag, definitionsById]);

  const overlayDraftElement = useMemo(() => {
    if (activeDrag?.type !== "draft-element") {
      return null;
    }

    return (
      draftElements.find((element) => element.id === activeDrag.elementId) ??
      null
    );
  }, [activeDrag, draftElements]);

  if (!node) {
    return null;
  }

  const handleRequestClose = () => {
    if (!isDirty || window.confirm("Discard unsaved step changes?")) {
      onClose();
    }
  };

  return (
    <Modal
      actions={
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            {validationErrors.length > 0
              ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"} to fix`
              : isDirty
                ? "Ready to save step edits"
                : "No unsaved changes"}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRequestClose} variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={validationErrors.length > 0 || !isDirty}
              isBusy={updateStepElementsMutation.isPending}
              onClick={() => void saveDraft()}
            >
              Save
            </Button>
          </div>
        </div>
      }
      description="Build this step with draggable elements and a focused property editor."
      isOpen={isOpen}
      onClose={handleRequestClose}
      size="xl"
      title={`Step editor: ${node.data.name}`}
    >
      <DndContext
        collisionDetection={stepEditorCollisionDetection}
        onDragCancel={clearDragState}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="grid h-[min(72vh,calc(92vh-180px))] min-h-0 grid-cols-[280px_minmax(0,1fr)_320px] gap-0 overflow-hidden">
          <StepElementPalettePanel
            definitions={stepElementDefinitionsQuery.data ?? []}
            isError={stepElementDefinitionsQuery.isError}
            isLoading={stepElementDefinitionsQuery.isPending}
            onAdd={addElement}
          />
          <StepElementCanvasPanel
            draftElements={draftElements}
            onCanvasKeyDown={handleCanvasKeyDown}
            onSelect={setSelectedElementId}
            previewInsertionIndex={previewInsertionIndex}
            selectedElementId={selectedElement?.id ?? null}
            stepName={node.data.name}
          />
          <StepElementPropertiesPanel
            htmlForOptions={htmlForOptions}
            onPropertyValueChange={(propertyId, value) =>
              updateSelectedElement((element) => ({
                ...element,
                properties: element.properties.map((property) =>
                  property.propertyId === propertyId
                    ? { ...property, value }
                    : property,
                ),
              }))
            }
            onRemoveElement={() =>
              selectedElement
                ? removeDraftElementById(selectedElement.id)
                : undefined
            }
            selectedElement={selectedElement}
            stepName={node.data.name}
            validationErrors={validationErrors}
          />
        </div>
        <DragOverlay>
          {overlayPaletteItem ? (
            <div className="w-[248px] rounded-2xl border border-sky-300/30 bg-slate-950/95 px-3 py-3 text-left shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
              <StepElementPalettePreviewCard definition={overlayPaletteItem} />
            </div>
          ) : overlayDraftElement ? (
            <div className="w-[min(100%,560px)] shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
              <StepDraftElementCard
                draftElements={draftElements}
                element={overlayDraftElement}
                isActive
                stepName={node.data.name}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Modal>
  );
};

export default StepNodeModal;
