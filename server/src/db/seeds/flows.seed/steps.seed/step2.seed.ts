import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export default async function seedStep2(models: Models) {
  const step2 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step2",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step2.id,
    elementId: "header",
    name: "Step 2 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step2.id,
    elementId: "label",
    name: "Step 2 label",
    order: 1,
  });

  const depositInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: step2.id,
    elementId: "numberInput",
    name: "Step 2 input",
    order: 2,
  });

  const tooltip = await models.StepElement.create({
    id: uuidV4(),
    stepId: step2.id,
    elementId: "tooltip",
    name: "Tooltip",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step2.id,
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
