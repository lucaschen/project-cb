import { Models } from "@db/models";
import { v4 as uuidV4 } from "uuid";

export async function seedStep8B(models: Models) {
  const step8B = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step8B",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "header",
    name: "Step8B title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "label",
    name: "Step8B label",
    order: 1,
  });

  const fullNameInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "text_input",
    name: "Full name input",
    order: 2,
  });

  const dobLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "label",
    name: "DOB label",
    order: 3,
  });

  const dobPicker = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "date_picker",
    name: "DOB picker",
    order: 4,
  });

  const submitButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step8B.id,
    elementId: "button",
    name: "Submit button",
    order: 5,
  });

  // ───────────────────
  // Element Properties
  // ───────────────────
  await models.StepElementProperties.bulkCreate([
    {
      id: uuidV4(),
      stepElementId: header.id,
      propertyId: "header_text",
      propertyValue: "One last thing, what's your full name?",
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
      propertyValue: fullNameInput.id,
    },
    {
      id: uuidV4(),
      stepElementId: fullNameInput.id,
      propertyId: "text_input_name",
      propertyValue: "full_name",
    },
    {
      id: uuidV4(),
      stepElementId: fullNameInput.id,
      propertyId: "text_input_required",
      propertyValue: "true",
    },
    // DOB label + picker
    {
      id: uuidV4(),
      stepElementId: dobLabel.id,
      propertyId: "label_text",
      propertyValue: "When is your Date of Birth",
    },
    {
      id: uuidV4(),
      stepElementId: dobLabel.id,
      propertyId: "label_for",
      propertyValue: dobPicker.id,
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "date_picker_name",
      propertyValue: "date_of_birth",
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "date_picker_format",
      propertyValue: "YYYY-MM-DD",
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "date_picker_required",
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

  console.log("🌱 Seeded Step8B");

  return step8B;
}
