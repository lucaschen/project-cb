import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "~sharedTypes/enums";

export default async function seedStep7(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step7",
    type: NodeType.STEP,
  });

  await models.NodeCoordinates.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step7 = await models.Step.create({
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
    name: "Step7 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step7 label",
    order: 1,
  });

  const lenderFeaturesSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "select",
    name: "Lender features select",
    order: 2,
  });

  const noThanksButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "button",
    name: "No Thanks button",
    order: 3,
  });

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
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
      propertyId: "headerText",
      propertyValue:
        "Are any of the following important to you when choosing a lender?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "Pick all the features you value most in a lender. <br> You can select more than one.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: lenderFeaturesSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "selectName",
      propertyValue: "lenderFeatures",
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "selectOptions",
      propertyValue:
        '["Offset/Redraw", "Fixed rate", "Major lender", "Mobile app"]',
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "selectRequired",
      propertyValue: "false",
    },
    {
      id: uuidV4(),
      stepElementId: lenderFeaturesSelect.id,
      propertyId: "selectMultiple",
      propertyValue: "true",
    },
    // Buttons
    {
      id: uuidV4(),
      stepElementId: noThanksButton.id,
      propertyId: "buttonText",
      propertyValue: "No Thanks",
    },
    {
      id: uuidV4(),
      stepElementId: noThanksButton.id,
      propertyId: "buttonVariant",
      propertyValue: "secondary",
    },
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
  ]);

  console.log("🌱 Seeded Step7");

  return step7;
}
