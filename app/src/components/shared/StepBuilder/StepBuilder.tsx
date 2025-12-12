import Draggable from "@app/components/shared/Draggable";
import { FORM_ELEMENTS, FormElement } from "@app/constants/form";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { DndContext, useDndMonitor } from "@dnd-kit/core";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import * as z from "zod";

import PreviewCanvas from "./components/PreviewCanvas";

const addElementDraggableDataSchema = z.object({
  type: z.literal("addElement"),
  formElementKey: z.enum(Object.keys(FORM_ELEMENTS)),
});

const StepBuilder = () => {
  const [formElements, setFormElements] = useState<FormElement[]>([]);

  useDndMonitor({
    onDragEnd(event) {
      console.log(event.active, event.over);
      if (event.over?.id !== "preview-canvas") return;
      const droppedElementData = event.active.data.current;

      const addElementData =
        addElementDraggableDataSchema.safeParse(droppedElementData);

      if (addElementData.success) {
        setFormElements((prevState) => [
          ...prevState,
          {
            key: addElementData.data.formElementKey,
            id: uuidV4(),
            properties: {},
          },
        ]);
      }
    },
  });

  return (
    <Flex width="100%">
      <Flex flexDirection="column" height="100%" padding="1" width="300px">
        <Heading margin="16px auto 0" size="md">
          Elements
        </Heading>
        <Flex flexDirection="column" gap="2">
          {Object.entries(FORM_ELEMENTS).map(([key, item]) => (
            <Box key={key} backgroundColor="white" color="black" padding="1">
              <Text>{item.label}</Text>
              <Draggable
                backgroundColor="white"
                data={{ formElementKey: key, type: "addElement" }}
                id={`sample_${key}`}
                padding="2"
              >
                {item.element}
              </Draggable>
            </Box>
          ))}
        </Flex>
      </Flex>
      <Flex
        backgroundColor="white"
        flex="1"
        flexDirection="column"
        height="100%"
      >
        <Heading color="black" margin="16px auto 0" size="md">
          Preview
        </Heading>
        <PreviewCanvas
          formElements={formElements}
          setFormElements={setFormElements}
        />
      </Flex>
      <Flex height="100%" width="300px">
        <Heading margin="16px auto 0" size="md">
          Right
        </Heading>
      </Flex>
    </Flex>
  );
};

const Wrapper = () => {
  return (
    <DndContext>
      <StepBuilder />
    </DndContext>
  );
};

export default Wrapper;
