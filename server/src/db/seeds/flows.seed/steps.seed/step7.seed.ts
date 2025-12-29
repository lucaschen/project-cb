import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep7(models: Models) {
  const step7 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step7",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step7.id,
    elementId: "header",
    name: "Step7 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step7.id,
    elementId: "label",
    name: "Step7 label",
    order: 1,
  });

  const lenderFeaturesSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: step7.id,
    elementId: "select",
    name: "Lender features select",
    order: 2,
  });

  const noThanksButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step7.id,
    elementId: "button",
    name: "No Thanks button",
    order: 3,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step7.id,
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
      propertyId: "header_text",
      propertyValue:
        "Are any of the following important to you when choosing a lender?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue:
        "Pick all the features you value most in a lender. <br> You can select more than one.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: lenderFeaturesSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "select_name",
      propertyValue: "lender_features",
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "select_options",
      propertyValue:
        "['Offset/Redraw', 'Fixed rate', 'Major lender', 'Mobile app']",
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "select_required",
      propertyValue: "false",
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "select_multiple",
      propertyValue: "true",
    },
    // Buttons
    {
      id: uuidV4(),
      stepElementId: noThanksButton.id,
      propertyId: "button_text",
      propertyValue: "No Thanks",
    },
    {
      id: uuidV4(),
      stepElementId: noThanksButton.id,
      propertyId: "button_variant",
      propertyValue: "secondary",
    },
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
  ]);

  console.log("🌱 Seeded Step7");

  return step7;
}
