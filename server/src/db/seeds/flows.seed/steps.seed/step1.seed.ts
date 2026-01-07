import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export default async function seedStep1(models: Models) {
  const step1 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step1",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step1.id,
    elementId: "header",
    name: "Purchase price title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step1.id,
    elementId: "label",
    name: "Purchase price label",
    order: 1,
  });

  const purchasePriceInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: step1.id,
    elementId: "numberInput",
    name: "Purchase price input",
    order: 2,
  });

  const tooltip = await models.StepElement.create({
    id: uuidV4(),
    stepId: step1.id,
    elementId: "tooltip",
    name: "Tooltip",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step1.id,
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
      propertyValue: "What is your expected purchase price?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "An estimate is fine—this helps us find the most suitable home loan options for you.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: purchasePriceInput.id,
    },
    // Purchase Price Input
    {
      id: uuidV4(),
      stepElementId: purchasePriceInput.id,
      propertyId: "numberInputFormat",
      propertyValue: "$0,0",
    },
    {
      id: uuidV4(),
      stepElementId: purchasePriceInput.id,
      propertyId: "numberInputName",
      propertyValue: "purchasePrice",
    },
    {
      id: uuidV4(),
      stepElementId: purchasePriceInput.id,
      propertyId: "numberInputRequired",
      propertyValue: "true",
    },
    // Tooltip
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipTriggerText",
      propertyValue: "?",
    },
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipHoverText",
      propertyValue:
        "Understanding your price range allows us to tailor loan options to your unique situation. Don’t worry if you’re not sure about the exact amount; an estimated figure based on the property type and location you're considering is a great start.",
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

  console.log("🌱 Seeded Step1");

  return step1;
}
