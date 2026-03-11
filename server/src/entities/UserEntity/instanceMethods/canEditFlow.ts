import FlowEntity from "~entities/FlowEntity";

import type UserEntity from "../UserEntity";

export default async function canEditFlow(
  this: UserEntity,
  flowId: string,
): Promise<boolean> {
  const flow = await FlowEntity.findById(flowId);

  if (!flow) {
    return false;
  }

  return this.canCreateFlowsInOrganization(flow.dbModel.organizationId);
}
