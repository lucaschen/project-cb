import { useSelectedNodeStore } from "@app/components/Root/stores/selectedNodeStore";
import { Box } from "@chakra-ui/react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";

export type StepConnectorEdgeData = {
  name: string;
  conditions?: {
    field: string;
    operation: "===" | ">=" | "<=";
    value: unknown;
  }[];
};

type Props = EdgeProps & {
  data: StepConnectorEdgeData;
  type: "stepConnectorEdgeData";
};

const StepConnectorEdge = ({
  data,
  id,
  markerEnd,
  sourcePosition,
  sourceX,
  sourceY,
  style = {},
  targetPosition,
  targetX,
  targetY,
}: Props) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { selectedItemId, setSelectedItem } = useSelectedNodeStore();

  const onEdgeClick = () => {
    setSelectedItem(selectedItemId === id ? null : { id, type: "edge" });
  };

  return (
    <>
      <BaseEdge
        markerEnd={markerEnd}
        path={edgePath}
        style={style}
        onClick={onEdgeClick}
      />
      <EdgeLabelRenderer>
        <Box
          backgroundColor="gray.300"
          borderColor={selectedItemId === id ? "gray.700" : "gray.400"}
          borderRadius="sm"
          borderStyle="solid"
          borderWidth="1px"
          className="button-edge__label nodrag nopan"
          color="black"
          padding="1"
          pointerEvents="all"
          position="absolute"
          transform={`translate(-50%, -50%) translate(${labelX}px,${labelY}px)`}
          transformOrigin="center"
          onClick={onEdgeClick}
        >
          {data.name}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

export default StepConnectorEdge;
