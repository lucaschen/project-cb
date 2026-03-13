import type {
  UpdateFlowMetadataInput,
  UpdateFlowMetadataOutput,
} from "@packages/shared/http/schemas/flows/updateFlowMetadata";

import type FlowEntity from "../FlowEntity";

export default async function updateMetadata(
  this: FlowEntity,
  metadata: UpdateFlowMetadataInput,
): Promise<UpdateFlowMetadataOutput> {
  if (metadata.name !== undefined) {
    this.dbModel.name = metadata.name;
  }

  if (metadata.description !== undefined) {
    this.dbModel.description = metadata.description;
  }

  await this.dbModel.save();

  return this.getPayload();
}
