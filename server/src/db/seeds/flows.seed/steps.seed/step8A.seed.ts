import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "../../../../../../packages/shared/src/types/enums";

export default async function seedStep8A(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step8A",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step8A = await models.Step.create({
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
    name: "Step8A title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step8A label",
    order: 1,
  });

  const firstNameInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "textInput",
    name: "First name input",
    order: 2,
  });

  const submitButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
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
      propertyId: "headerText",
      propertyValue: "One last thing, what's your first name?",
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
      propertyValue: firstNameInput.id,
    },
    {
      id: uuidV4(),
      stepElementId: firstNameInput.id,
      propertyId: "textInputName",
      propertyValue: "firstName",
    },
    {
      id: uuidV4(),
      stepElementId: firstNameInput.id,
      propertyId: "textInputRequired",
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

  console.log("🌱 Seeded Step8A");

  return step8A;
}
