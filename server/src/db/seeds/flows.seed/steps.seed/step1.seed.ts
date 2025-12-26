import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep1(models: Models) {
  const step1 = await models.Step.create({
    id: "step_purchase_price",
    flowId: "seedFlow1",
    name: "Expected Purchase Price",
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
    elementId: "number_input",
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

  // ───────────────────
  // Element Properties
  // ───────────────────
  await models.StepElementProperties.bulkCreate([
    // Header
    {
      id: uuidV4(),
      stepElementId: header.id,
      propertyId: "header_text",
      propertyValue: "What is your expected purchase price?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue:
        "An estimate is fine—this helps us find the most suitable home loan options for you.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: purchasePriceInput.id,
    },
    // Purchase Price Input
    {
      id: uuidV4(),
      stepElementId: purchasePriceInput.id,
      propertyId: "number_input_format",
      propertyValue: "$0,0",
    },
    {
      id: uuidV4(),
      stepElementId: purchasePriceInput.id,
      propertyId: "number_input_name",
      propertyValue: "purchase_price",
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
        "Understanding your price range allows us to tailor loan options to your unique situation. Don’t worry if you’re not sure about the exact amount; an estimated figure based on the property type and location you're considering is a great start.",
    },
  ]);

  console.log("🌱 Seeded purchase price step");

  return step1;
}
