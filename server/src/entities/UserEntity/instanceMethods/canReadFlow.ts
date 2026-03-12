import FlowEntity from "~entities/FlowEntity";

import type UserEntity from "../UserEntity";

export default async function canReadFlow(
  this: UserEntity,
  flowId: string,
): Promise<boolean> {
  const flow = await FlowEntity.findById(flowId);

  if (!flow) {
    return false;
  }

  return this.canReadFlowsInOrganization(flow.dbModel.organizationId);
}
