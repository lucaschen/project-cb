import { StepConnectorEdgeData } from "@app/components/shared/FlowEdges/StepConnectorEdge";
import { Button, Field, Heading, Input, Text } from "@chakra-ui/react";
import { Edge } from "@xyflow/react";
import { useState } from "react";

type Props = {
  selectedEdge: Edge<StepConnectorEdgeData>;
  updateEdgeData: (data: StepConnectorEdgeData) => void;
};

const StepConnectorContent = ({ selectedEdge, updateEdgeData }: Props) => {
  const [stagingStepName, setStagingStepName] = useState(
    selectedEdge.data?.name ?? "",
  );

  return (
    <>
      <Heading fontWeight="bold" mb="24px" size="md">
        Update Connector
      </Heading>
      {selectedEdge ? (
        <>
          <Field.Root>
            <Field.Label>Connector Name</Field.Label>
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
      <Heading mt="4" size="md">
        Conditions
      </Heading>
      <Text>WIP</Text>
      <Button
        mt="2"
        onClick={() => {
          updateEdgeData({ name: stagingStepName, conditions: [] });
        }}
      >
        Save
      </Button>
    </>
  );
};

export default StepConnectorContent;
