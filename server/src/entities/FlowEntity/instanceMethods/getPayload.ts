import type { FlowType } from "@packages/shared/http/schemas/flows/common";

import type FlowEntity from "../FlowEntity";

export default function getPayload(this: FlowEntity): FlowType {
  return {
    description: this.dbModel.description ?? null,
    id: this.dbModel.id,
    name: this.dbModel.name,
    organizationId: this.dbModel.organizationId,
    slug: this.dbModel.slug,
  };
}
