import FlowBuilderEntity from "@packages/shared/entities/FlowBuilderEntity/FlowBuilderEntity";
import type { FlowGraph } from "@packages/shared/entities/FlowGraphEntity/types/flowGraph";
import type { UpdateBuilderInput } from "@packages/shared/http/schemas/flows/builder/updateBuilder";

export const graphToUpdateBuilderInput = (
  graph: FlowGraph,
): UpdateBuilderInput => {
  return FlowBuilderEntity.fromGraph(graph).getPayload();
};
