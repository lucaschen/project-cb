import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export default async function seedStep4(models: Models) {
  const step4 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step4",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4.id,
    elementId: "header",
    name: "Step4 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4.id,
    elementId: "label",
    name: "Step4 label",
    order: 1,
  });

  const firstHomeBuyerSelect = await models.StepElement.create({
    id: "step4FirstHomeBuyerSelect",
    stepId: step4.id,
    elementId: "select",
    name: "Step4 select",
    order: 2,
  });

  const tooltip = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4.id,
    elementId: "tooltip",
    name: "Tooltip",
    order: 3,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4.id,
    elementId: "button",
    name: "Next button",
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
      propertyValue: "Are you a first home buyer?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "First home buyers may qualify for grants and benefits. Let us know if you're purchasing for the first time.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: firstHomeBuyerSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectName",
      propertyValue: "firstHomeBuyer",
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectOptions",
      propertyValue: '["Yes", "No"]',
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectRequired",
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
        "Find out more about grants, stamp duty concessions, and other benefits available to first home buyers.",
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

  console.log("🌱 Seeded Step4");

  return step4;
}
