import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep8A(models: Models) {
  const step8A = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step8A",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8A.id,
    elementId: "header",
    name: "Step8A title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8A.id,
    elementId: "label",
    name: "Step8A label",
    order: 1,
  });

  const firstNameInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8A.id,
    elementId: "text_input",
    name: "First name input",
    order: 2,
  });

  const submitButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8A.id,
    elementId: "button",
    name: "Submit button",
    order: 3,
  });

  // ───────────────────
  // Element Properties
  // ───────────────────
  await models.StepElementProperties.bulkCreate([
    {
      id: uuidV4(),
      stepElementId: header.id,
      propertyId: "header_text",
      propertyValue: "One last thing, what's your first name?",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue: "We're excited to help you find the perfect home loan!",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: firstNameInput.id,
    },
    {
      id: uuidV4(),
      stepElementId: firstNameInput.id,
      propertyId: "text_input_name",
      propertyValue: "first_name",
    },
    {
      id: uuidV4(),
      stepElementId: firstNameInput.id,
      propertyId: "text_input_required",
      propertyValue: "true",
    },
    {
      id: uuidV4(),
      stepElementId: submitButton.id,
      propertyId: "button_text",
      propertyValue: "Get my home loan matches",
    },
    {
      id: uuidV4(),
      stepElementId: submitButton.id,
      propertyId: "button_variant",
      propertyValue: "primary",
    },
  ]);

  console.log("🌱 Seeded Step8A");

  return step8A;
}
