import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "~sharedTypes/enums";

export default async function seedStep8B(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step8B",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step8B = await models.Step.create({
    nodeId: baseNode.id,
    nextNodeId: null,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "header",
    name: "Step8B title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step8B label",
    order: 1,
  });

  const fullNameInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "textInput",
    name: "Full name input",
    order: 2,
  });

  const dobLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "DOB label",
    order: 3,
  });

  const dobPicker = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "datePicker",
    name: "DOB picker",
    order: 4,
  });

  const submitButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
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
      propertyId: "headerText",
      propertyValue: "One last thing, what's your full name?",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue: "We're excited to help you find the perfect home loan!",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: fullNameInput.id,
    },
    {
      id: uuidV4(),
      stepElementId: fullNameInput.id,
      propertyId: "textInputName",
      propertyValue: "fullName",
    },
    {
      id: uuidV4(),
      stepElementId: fullNameInput.id,
      propertyId: "textInputRequired",
      propertyValue: "true",
    },
    // DOB label + picker
    {
      id: uuidV4(),
      stepElementId: dobLabel.id,
      propertyId: "labelText",
      propertyValue: "When is your Date of Birth?",
    },
    {
      id: uuidV4(),
      stepElementId: dobLabel.id,
      propertyId: "labelFor",
      propertyValue: dobPicker.id,
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "datePickerName",
      propertyValue: "dateOfBirth",
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "datePickerFormat",
      propertyValue: "YYYY-MM-DD",
    },
    {
      id: uuidV4(),
      stepElementId: dobPicker.id,
      propertyId: "datePickerRequired",
      propertyValue: "true",
    },
    {
      id: uuidV4(),
      stepElementId: submitButton.id,
      propertyId: "buttonText",
      propertyValue: "Get my home loan matches",
    },
    {
      id: uuidV4(),
      stepElementId: submitButton.id,
      propertyId: "buttonVariant",
      propertyValue: "primary",
    },
  ]);

  console.log("🌱 Seeded Step8B");

  return step8B;
}
