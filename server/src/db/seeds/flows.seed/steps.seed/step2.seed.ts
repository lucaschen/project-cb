import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "../../../../../../packages/shared/src/types/enums";

export default async function seedStep2(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step2",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step2 = await models.Step.create({
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
    name: "Step 2 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step 2 label",
    order: 1,
  });

  const depositInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "numberInput",
    name: "Step 2 input",
    order: 2,
  });

  const tooltip = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "tooltip",
    name: "Tooltip",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "button",
    name: "Next button",
    order: 3,
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
      propertyValue: "How much deposit do you have?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "This helps us calculate your Loan-to-Value Ratio (LVR), which may qualify you for better home loan rates and terms.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: depositInput.id,
    },
    // Purchase Price Input
    {
      id: uuidV4(),
      stepElementId: depositInput.id,
      propertyId: "numberInputFormat",
      propertyValue: "$0,0",
    },
    {
      id: uuidV4(),
      stepElementId: depositInput.id,
      propertyId: "numberInputName",
      propertyValue: "purchasePrice",
    },
    {
      id: uuidV4(),
      stepElementId: depositInput.id,
      propertyId: "numberInputRequired",
      propertyValue: "true",
    },
    // Tooltip
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipTriggerText",
      propertyValue: "? Understanding your LVR",
    },
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipHoverText",
      propertyValue: "It is important for unknown reasons",
    },
    // Next button
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "buttonText",
      propertyValue: "Next",
    },
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "buttonVariant",
      propertyValue: "primary",
    },
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "buttonDisableWhenIncomplete",
      propertyValue: "true",
    },
  ]);

  console.log("🌱 Seeded Step2");

  return step2;
}
