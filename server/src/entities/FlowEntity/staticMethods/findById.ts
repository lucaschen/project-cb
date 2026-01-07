import { Flow } from "~db/models/Flow";

import type FlowEntity from "../FlowEntity";

export default async function findById(
  this: typeof FlowEntity,
  id: string
): Promise<FlowEntity | null> {
  const flow = await Flow.findByPk(id);

  if (!flow) return null;

  return new this(flow);
}
