import { useSelectedNodeStore } from "@app/components/Root/stores/selectedNodeStore";
import { StepConnectorEdgeData } from "@app/components/shared/FlowEdges/StepConnectorEdge";
import { StepNodeData } from "@app/components/shared/FlowNodes/StepNode";
import { Box } from "@chakra-ui/react";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useMemo } from "react";

import StepConnectorContent from "./components/StepConnectorContent";
import StepNodeContent from "./components/StepNodeContent";

const AttributeSidebar = () => {
  const { getEdges, getNodes, setEdges, setNodes } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();

  const { selectedItemId, selectedItemType } = useSelectedNodeStore();

  const selectedItem = useMemo(() => {
    if (selectedItemId === null) return null;

    if (selectedItemType === "node") {
      const selectedNode = nodes.find(
        (node) => node.id === selectedItemId,
      ) as Node<StepNodeData>; // TODO: typecheck utils and check before assigning type

      if (!selectedNode) return null;

      return { item: selectedNode, type: "node" } as const;
    }

    const selectedEdge = edges.find(
      (edge) => edge.id === selectedItemId,
    ) as Edge<StepConnectorEdgeData>; // TODO: typecheck utils and check before assigning type
    if (!selectedEdge) return null;

    return { item: selectedEdge, type: "edge" } as const;
  }, [selectedItemId, selectedItemType, edges, nodes]);

  const updateStepNode = (data: StepNodeData) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === selectedItemId) {
          return { ...node, data };
        }

        return node;
      }),
    );
  };

  const updateEdgeData = (data: StepConnectorEdgeData) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === selectedItemId) {
          return { ...edge, data };
        }

        return edge;
      }),
    );
  };

  if (!selectedItem) return null;

  return (
    <Box
      bg="gray.950"
      borderColor="gray.700"
      borderRight="1px solid"
      color="white"
      p={4}
      width="420px"
    >
      {selectedItem.type === "node" ? (
        <StepNodeContent
          key={selectedItem.item.id}
          selectedNode={selectedItem.item}
          updateNodeData={updateStepNode}
        />
      ) : (
        <StepConnectorContent
          key={selectedItem.item.id}
          selectedEdge={selectedItem.item}
          updateEdgeData={updateEdgeData}
        />
      )}
    </Box>
  );
};

export default AttributeSidebar;
