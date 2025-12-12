import { useSelectedNodeStore } from "@app/components/Root/stores/selectedNodeStore";
import { Flex, Text } from "@chakra-ui/react";
import { Handle, NodeProps, Position } from "@xyflow/react";

export type StepNodeData = {
  name: string;
};

type Props = NodeProps & {
  type: "stepNode";
  data: StepNodeData;
};

const StepNode = ({ id, data }: Props) => {
  const stepName = data.name;
  const { selectedItemId, setSelectedItem } = useSelectedNodeStore();

  return (
    <Flex
      backgroundColor="teal.400"
      borderColor={selectedItemId === id ? "teal.800" : "transparent"}
      borderStyle="solid"
      borderWidth="1px"
      cursor="pointer"
      padding="2"
      onClick={() => {
        setSelectedItem(selectedItemId === id ? null : { id, type: "node" });
      }}
    >
      <Handle position={Position.Left} type="target" onConnect={() => {}} />
      <Text backgroundColor="teal.400" fontSize="sm">
        {stepName}
      </Text>
      <Handle position={Position.Right} type="source" />
    </Flex>
  );
};

export default StepNode;
