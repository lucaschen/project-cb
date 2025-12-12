import SortableItem from "@app/components/shared/SortableItem";
import { FORM_ELEMENTS, FormElement } from "@app/constants/form";
import { Flex } from "@chakra-ui/react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

type Props = {
  formElements: FormElement[];
  setFormElements: React.Dispatch<React.SetStateAction<FormElement[]>>;
};

const PreviewCanvas = ({ formElements, setFormElements }: Props) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: "preview-canvas",
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(`${active.id}`);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    if (!over) return;

    setFormElements((formElements) => {
      const oldIndex = formElements.findIndex(
        (formElement) => formElement.id === active.id,
      );
      const newIndex = formElements.findIndex(
        (formElement) => formElement.id === over.id,
      );

      return arrayMove(formElements, oldIndex, newIndex);
    });
  };

  return (
    <Flex
      ref={setDroppableRef}
      borderColor={isOver ? "green.300" : "transparent"}
      borderRadius="sm"
      borderStyle="solid"
      borderWidth="2px"
      color="black"
      flex="1"
      flexDirection="column"
      gap="2"
      padding="2"
    >
      active: {activeId}
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={formElements}
          strategy={verticalListSortingStrategy}
        >
          {formElements.map((formEl) => (
            <SortableItem key={formEl.id} id={formEl.id}>
              {FORM_ELEMENTS[formEl.key].element}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </Flex>
  );
};

export default PreviewCanvas;
