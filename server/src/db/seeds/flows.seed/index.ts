import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { ComparisonOperation } from "~sharedTypes/enums";

import { seedSteps } from "./steps.seed";

export async function seedFlows(models: Models) {
  // ───────────────────
  // Flow
  // ───────────────────
  await models.Flow.create({
    id: "seedFlow1",
    organizationId: "seedOrg1",
    name: "Main Flow",
    slug: "main-flow",
  });

  const steps = await seedSteps(models);

  // ───────────────────
  // Decision nodes & connections
  // Represent: if Step4.firstHomeBuyer === 'No' then go to Step4Point5, else continue to Step5
  // ───────────────────

  // create a decision node that checks firstHomeBuyer
  const decision = await models.DecisionNode.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "First home buyer check",
    // the node will evaluate the expression in `targetValue` and compare to `comparisonValue`
    targetValue: `stepElementValueByName(firstHomeBuyer)`,
    operation: ComparisonOperation.EQ,
    comparisonValue: "No",
    x: 200,
    y: 200,
  });

  // ───────────────────
  // Linear step connections
  // ───────────────────
  // Step1 -> Step2
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step1.id,
    toNodeId: steps.step2.id,
    fromNodeConnectionIndex: 0,
  });

  // Step2 -> Step3
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step2.id,
    toNodeId: steps.step3.id,
    fromNodeConnectionIndex: 0,
  });

  // Step3 -> Step4
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step3.id,
    toNodeId: steps.step4.id,
    fromNodeConnectionIndex: 0,
  });

  // connect Step4 -> decision
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step4.id,
    toNodeId: decision.id,
    fromNodeConnectionIndex: 0,
  });

  // connect decision -> Step4Point5 (No)
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: decision.id,
    toNodeId: steps.step4Point5.id,
    fromNodeConnectionIndex: 0,
  });

  // connect decision -> Step5 (default / Yes)
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: decision.id,
    toNodeId: steps.step5.id,
    fromNodeConnectionIndex: 1,
  });

  // Step4Point5 -> Step5 (ensure 4.5 connects back to main flow)
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step4Point5.id,
    toNodeId: steps.step5.id,
    fromNodeConnectionIndex: 0,
  });

  // Step5 -> Step6
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step5.id,
    toNodeId: steps.step6.id,
    fromNodeConnectionIndex: 0,
  });

  // Step6 -> Step7
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step6.id,
    toNodeId: steps.step7.id,
    fromNodeConnectionIndex: 0,
  });

  // ───────────────────
  // Experiment (A/B 30/70): Step7 -> decision -> Step8A (30%) or Step8B (70%)
  // ───────────────────
  const expDecision = await models.DecisionNode.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step8 A/B experiment",
    targetValue: `randomNumber(0, 100)`,
    operation: ComparisonOperation.LTE,
    comparisonValue: "30",
    x: 300,
    y: 200,
  });

  // connect Step7 -> experiment decision
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: steps.step7.id,
    toNodeId: expDecision.id,
    fromNodeConnectionIndex: 0,
  });

  // decision -> Step8A (30%)
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: expDecision.id,
    toNodeId: steps.step8A.id,
    fromNodeConnectionIndex: 0,
  });

  // decision -> Step8B (70%)
  await models.Connection.create({
    id: uuidV4(),
    fromNodeId: expDecision.id,
    toNodeId: steps.step8B.id,
    fromNodeConnectionIndex: 1,
  });

  console.log("🌱 Seeded Main Flow");
}
