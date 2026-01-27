import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import {
  ComparisonOperation,
  NodeType,
} from "../../../../../../packages/shared/src/types/enums";

export default async function seedStep6(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step6",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step6 = await models.Step.create({
    nodeId: baseNode.id,
    nextNodeId: null,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "header",
    name: "Step6 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step6 label",
    order: 1,
  });

  const propertyUsageSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "select",
    name: "Property usage select",
    order: 2,
  });

  // conditional experiment elements (may be shown randomly when Step4.isFirstHome === false)
  const hasExistingInvestmentLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Existing investment label",
    order: 3,
  });

  const hasExistingInvestmentSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "select",
    name: "Existing investment select",
    order: 4,
  });

  // ───────────────────
  // Element Properties
  // ───────────────────
  await models.StepElementProperties.bulkCreate([
    // Header
    {
      id: uuidV4(),
      stepElementId: header.id,
      propertyId: "headerText",
      propertyValue: "How will this property be used?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "Is this property your home or an investment? Your answer helps us tailor your home loan options.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: propertyUsageSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "selectName",
      propertyValue: "propertyUsage",
    },
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "selectOptions",
      propertyValue: '["I will live there", "Its an investment"]',
    },
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "selectRequired",
      propertyValue: "true",
    },
    // Experiment: additional question when selected by experiment
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      propertyId: "labelText",
      propertyValue: "Do you have an existing investment property?",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "selectName",
      propertyValue: "hasExistingInvestment",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "selectOptions",
      propertyValue: '["Yes", "No"]',
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "selectRequired",
      propertyValue: "true",
    },
  ]);

  // ───────────────────
  // Experiment conditions: show when Step4.firstHomeBuyer === 'No' AND randomNumber(0,100) <= 50
  // ───────────────────
  await models.StepElementCondition.bulkCreate([
    // label conditions
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "stepElementValue",
          stepElementId: "step4FirstHomeBuyerSelect",
        },
        rightValue: "No",
        operator: ComparisonOperation.EQ,
      },
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "randomNumber",
          min: 0,
          max: 100,
        },
        operator: ComparisonOperation.LTE,
        rightValue: "50",
      },
    },
    // select conditions
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "stepElementValue",
          stepElementId: "step4FirstHomeBuyerSelect",
        },
        rightValue: "No",
        operator: ComparisonOperation.EQ,
      },
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "randomNumber",
          min: 0,
          max: 100,
        },
        operator: ComparisonOperation.LTE,
        rightValue: "50",
      },
    },
  ]);

  console.log("🌱 Seeded Step6");

  return step6;
}
