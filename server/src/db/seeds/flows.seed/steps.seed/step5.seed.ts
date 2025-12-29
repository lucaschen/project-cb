import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep1(models: Models) {
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
      propertyId: "header_text",
      propertyValue: "What kind of property are you looking to buy?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue:
        "The type of property you're looking to buy helps us determine the most suitable loan products for your needs.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: idealPropertyType.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "select_name",
      propertyValue: "ideal_property_type",
    },
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "select_options",
      propertyValue:
        "['Newly built/Off the play', 'Established home', 'Vacant land']",
    },
    {
      id: uuidV4(),
      stepElementId: idealPropertyType.id,
      propertyId: "select_required",
      propertyValue: "true",
    },
  ]);

  // Next button properties
  await models.StepElementProperties.bulkCreate([
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "button_text",
      propertyValue: "Next",
    },
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "button_variant",
      propertyValue: "primary",
    },
    {
      id: uuidV4(),
      stepElementId: nextButton.id,
      propertyId: "button_disable_when_incomplete",
      propertyValue: "true",
    },
  ]);

  console.log("🌱 Seeded Step5");

  return step5;
}
