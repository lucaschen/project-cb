import { StepNodeData } from "@app/components/shared/FlowNodes/StepNode";
import StepBuilder from "@app/components/shared/StepBuilder";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Heading,
  Input,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import { Node } from "@xyflow/react";
import { useState } from "react";

type Props = {
  selectedNode: Node<StepNodeData>;
  updateNodeData: (data: StepNodeData) => void;
};

const StepNodeContent = ({ selectedNode, updateNodeData }: Props) => {
  const [stagingStepName, setStagingStepName] = useState(
    selectedNode.data.name,
  );
  const { open, setOpen } = useDisclosure();

  return (
    <>
      <Heading fontWeight="bold" mb="24px" size="md">
        Update Step
      </Heading>
      {selectedNode ? (
        <>
          <Field.Root>
            <Field.Label>Step Name</Field.Label>
            <Input
              autoComplete="off"
              name="step-name"
              type="text"
              value={stagingStepName}
              onChange={(event) => setStagingStepName(event.target.value)}
            />
          </Field.Root>
        </>
      ) : null}
      <Flex gap="2">
        <Button
          mt="2"
          onClick={() => {
            setOpen(true);
          }}
        >
          Inspect Step
        </Button>
        <Button
          mt="2"
          onClick={() => {
            updateNodeData({ name: stagingStepName });
          }}
        >
          Save
        </Button>
      </Flex>
      <Dialog.Root
        motionPreset="slide-in-bottom"
        open={open}
        size="full"
        onOpenChange={({ open }) => setOpen(open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Step Builder</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body display="flex" padding="0">
                <StepBuilder />
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button>Save</Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default StepNodeContent;
