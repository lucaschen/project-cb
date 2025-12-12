import { flowEdgeMapping } from "@app/components/shared/FlowEdges";
import { flowNodeMapping } from "@app/components/shared/FlowNodes";
import { Box, Flex, Heading } from "@chakra-ui/react";
import {
  addEdge,
  Edge,
  FitViewOptions,
  Node,
  OnConnect,
  OnNodeDrag,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { MouseEvent, useCallback, useState } from "react";

import AttributeSidebar from "./components/AttributeSidebar";

let idTracker = 0;

const getId = () => `${++idTracker}`;

const initialNodes: Node[] = [
  {
    id: getId(),
    type: "stepNode",
    data: { name: "Step 1" },
    position: { x: 5, y: 5 },
  },
  {
    id: getId(),
    type: "stepNode",
    data: { name: "Step 2" },
    position: { x: 5, y: 100 },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "stepConnectorEdge",
    data: {
      name: "step1 - step2 connector",
    },
  },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const Root = () => {
  const [interactionType, setInteractionType] = useState<
    "default" | "createStep"
  >("default");
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [ghostScreenPos, setGhostScreenPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((edgesSnapshot) =>
        addEdge(
          { ...params, type: "stepConnectorEdge", data: { name: "connector" } },
          edgesSnapshot,
        ),
      );
    },
    [setEdges],
  );

  const handlePaneCick = useCallback(
    (event: MouseEvent) => {
      if (interactionType !== "createStep") return;

      const id = getId();
      const newNode: Node = {
        id,
        type: "stepNode",
        position: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        data: { name: `Step ${id}` },
        origin: [0.5, 0.5],
      };

      setNodes((prevState) => prevState.concat(newNode));
    },
    [interactionType, screenToFlowPosition, setNodes],
  );

  const handlePaneMouseMove = useCallback(
    (event: MouseEvent) => {
      if (interactionType !== "createStep") {
        setGhostScreenPos(null);
        return;
      }
      setGhostScreenPos({ x: event.clientX, y: event.clientY });
    },
    [interactionType],
  );

  const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log("drag event", node.data);
  };

  return (
    <Flex height="100vh" overflow="hidden">
      <Box
        bg="gray.950"
        borderColor="gray.700"
        borderRight="1px solid"
        color="white"
        p={4}
        width="420px"
      >
        <Heading fontWeight="bold" mb="24px" size="md">
          Create Form Flow
        </Heading>
        <Flex gap="8px" wrap="wrap">
          <Flex
            alignItems="center"
            bg={
              interactionType === "default"
                ? "whiteAlpha.600"
                : "whiteAlpha.300"
            }
            cursor="pointer"
            height="120px"
            justifyContent="center"
            width="120px"
            onClick={() => {
              setInteractionType("default");
            }}
          >
            Inspect
          </Flex>
          <Flex
            alignItems="center"
            bg={
              interactionType === "createStep"
                ? "whiteAlpha.600"
                : "whiteAlpha.300"
            }
            cursor="pointer"
            height="120px"
            justifyContent="center"
            width="120px"
            onClick={() => {
              setInteractionType((prevState) => {
                if (prevState === "createStep") {
                  return "default";
                }

                return "createStep";
              });
            }}
          >
            Add Steps
          </Flex>
        </Flex>
      </Box>
      <Flex bg="gray.50" flex="1" gap="24px" overflowY="auto">
        <ReactFlow
          fitView
          edges={edges}
          edgeTypes={flowEdgeMapping}
          fitViewOptions={fitViewOptions}
          nodes={nodes}
          nodeTypes={flowNodeMapping}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodeDrag={onNodeDrag}
          onNodesChange={onNodesChange}
          onPaneClick={handlePaneCick}
          onPaneMouseMove={handlePaneMouseMove}
        />
        {interactionType === "createStep" && ghostScreenPos ? (
          <Box
            background="gray.500"
            height="100px"
            left={`${ghostScreenPos.x}px`}
            opacity={0.3}
            pointerEvents="none"
            position="fixed"
            top={`${ghostScreenPos.y}px`}
            transform="translate(-50%, -50%)"
            width="200px"
            zIndex={9}
          />
        ) : null}
      </Flex>
      <AttributeSidebar />
    </Flex>
  );
};

export default Root;
