import { ComparisonOperation, NodeType } from "@packages/shared/types/enums";
import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

import { seedSteps } from "./steps.seed";

export async function seedFlows(models: Models) {
  const organization = await models.Organization.findOne({
    where: { slug: "seed-org" },
  });

  if (!organization) {
    throw new Error("Organization not found for flow");
  }

  // ───────────────────
  // Flow
  // ───────────────────
  const flow = await models.Flow.create({
    id: uuidV4(),
    organizationId: organization.id,
    name: "Main Flow",
    slug: "main-flow",
  });

  const steps = await seedSteps(models);

  await Promise.all([
    steps.step1.update({ order: 0 }),
    steps.step2.update({ order: 1 }),
    steps.step3.update({ order: 2 }),
    steps.step4.update({ order: 3 }),
    steps.step4Point5.update({ order: 4 }),
    steps.step5.update({ order: 5 }),
    steps.step6.update({ order: 6 }),
    steps.step7.update({ order: 7 }),
    steps.step8A.update({ order: 8 }),
    steps.step8B.update({ order: 9 }),
  ]);

  // ───────────────────
  // Decision nodes & connections
  // Represent: if Step4.firstHomeBuyer === 'No' then go to Step4Point5, else continue to Step5
  // ───────────────────

  await steps.step1.update({ nextNodeId: steps.step2.nodeId });
  await steps.step2.update({ nextNodeId: steps.step3.nodeId });
  await steps.step3.update({ nextNodeId: steps.step4.nodeId });

  const step4DecisionBaseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step4Decision",
    type: NodeType.DECISION,
  });

  await steps.step4.update({ nextNodeId: step4DecisionBaseNode.id });

  await models.NodeCoordinate.create({
    nodeId: step4DecisionBaseNode.id,
    x: 100,
    y: 100,
  });
  const step4DecisionNode = await models.DecisionNode.create({
    nodeId: step4DecisionBaseNode.id,
    fallbackNextNodeId: steps.step5.nodeId,
  });
  await models.DecisionNodeCondition.create({
    id: uuidV4(),
    nodeId: step4DecisionNode.nodeId,
    toNodeId: steps.step4Point5.nodeId,
    statement: {
      type: "comparison",
      leftValue: {
        type: "stepElementValue",
        stepElementId: "step4FirstHomeBuyerSelect",
      },
      operator: ComparisonOperation.EQ,
      rightValue: "No",
    },
    order: 0,
  });

  await steps.step4Point5.update({ nextNodeId: steps.step5.nodeId });
  await steps.step5.update({ nextNodeId: steps.step6.nodeId });
  await steps.step6.update({ nextNodeId: steps.step7.nodeId });

  const step7DecisionBaseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step7Decision",
    type: NodeType.DECISION,
  });

  await steps.step7.update({ nextNodeId: step7DecisionBaseNode.id });

  await models.NodeCoordinate.create({
    nodeId: step7DecisionBaseNode.id,
    x: 100,
    y: 100,
  });
  const step7DecisionNode = await models.DecisionNode.create({
    nodeId: step7DecisionBaseNode.id,
    fallbackNextNodeId: steps.step8B.nodeId,
  });
  await models.DecisionNodeCondition.create({
    id: uuidV4(),
    nodeId: step7DecisionNode.nodeId,
    toNodeId: steps.step8A.nodeId,
    statement: {
      type: "comparison",
      leftValue: {
        type: "randomNumber",
        min: 0,
        max: 100,
      },
      operator: ComparisonOperation.GTE,
      rightValue: 50,
    },
    order: 0,
  });

  console.log("🌱 Seeded Main Flow");
}
