import { Flow } from "~db/models/Flow";

import type FlowEntity from "../FlowEntity";

export default async function findByOrganizationId(
  this: typeof FlowEntity,
  organizationId: string,
): Promise<FlowEntity[]> {
  const flows = await Flow.findAll({
    order: [
      ["name", "ASC"],
      ["id", "ASC"],
    ],
    where: { organizationId },
  });

  return flows.map((flow) => new this(flow));
}
