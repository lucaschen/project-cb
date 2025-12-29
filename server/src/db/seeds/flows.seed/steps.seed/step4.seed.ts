import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep1(models: Models) {
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
    id: "step4_first_home_buyer_select",
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
      propertyId: "header_text",
      propertyValue: "Are you a first home buyer?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue:
        "First home buyers may qualify for grants and benefits. Let us know if you're purchasing for the first time.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: firstHomeBuyerSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "select_name",
      propertyValue: "first_home_buyer",
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "select_options",
      propertyValue: "['Yes', 'No']",
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "select_required",
      propertyValue: "true",
    },
    // Tooltip
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltip_trigger_text",
      propertyValue: "?",
    },
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltip_hover_text",
      propertyValue:
        "Find out more about grants, stamp duty concessions, and other benefits available to first home buyers.",
    },
    // Next button
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

  console.log("🌱 Seeded Step4");

  return step4;
}
