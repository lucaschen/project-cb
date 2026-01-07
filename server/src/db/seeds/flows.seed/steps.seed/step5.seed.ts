import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export default async function seedStep5(models: Models) {
  const step5 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step5",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step5.id,
    elementId: "header",
    name: "Step5 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step5.id,
    elementId: "label",
    name: "Step5 label",
    order: 1,
  });

  const idealPropertyType = await models.StepElement.create({
    id: uuidV4(),
    stepId: step5.id,
    elementId: "select",
    name: "Step5 select",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step5.id,
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
      propertyValue: "What kind of property are you looking to buy?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "The type of property you're looking to buy helps us determine the most suitable loan products for your needs.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: idealPropertyType.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "selectName",
      propertyValue: "idealPropertyType",
    },
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "selectOptions",
      propertyValue:
        '["Newly built/Off the plan", "Established home", "Vacant land"]',
    },
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "selectRequired",
      propertyValue: "true",
    },
  ]);

  // Next button properties
  await models.StepElementProperties.bulkCreate([
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

  console.log("🌱 Seeded Step5");

  return step5;
}
