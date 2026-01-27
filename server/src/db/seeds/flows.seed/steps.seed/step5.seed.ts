import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "~sharedTypes/enums";

export default async function seedStep5(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step5",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step5 = await models.Step.create({
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
    name: "Step5 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step5 label",
    order: 1,
  });

  const idealPropertyType = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "select",
    name: "Step5 select",
    order: 2,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
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
