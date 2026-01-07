import { Models } from "~db/models";
import { v4 as uuidV4 } from "uuid";

export default async function seedStep3(models: Models) {
  const step3 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step3",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step3.id,
    elementId: "header",
    name: "Step3 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step3.id,
    elementId: "label",
    name: "Step3 label",
    order: 1,
  });

  const situationSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: step3.id,
    elementId: "select",
    name: "Step3 select",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step3.id,
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
      propertyValue: "What best describes your home buying situation?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "Understanding your position in the home buying journey lets us guide you with the most relevant support.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: situationSelect.id,
    },
    // Step3 Input
    {
      id: uuidV4(),
      stepElementId: situationSelect.id,
      propertyId: "selectName",
      propertyValue: "homeBuyingSituation",
    },
    {
      id: uuidV4(),
      stepElementId: situationSelect.id,
      propertyId: "selectOptions",
      propertyValue:
        '["Just exploring options", "Planning to buy in 6 months", "Made an offer", "Exchanged contracts"]',
    },
    {
      id: uuidV4(),
      stepElementId: situationSelect.id,
      propertyId: "selectRequired",
      propertyValue: "true",
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

  console.log("🌱 Seeded Step3");

  return step3;
}
