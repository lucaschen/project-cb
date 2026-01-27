import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";
import { NodeType } from "../../../../../../packages/shared/src/types/enums";

export default async function seedStep4(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step4",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step4 = await models.Step.create({
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
    name: "Step4 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step4 label",
    order: 1,
  });

  const firstHomeBuyerSelect = await models.StepElement.create({
    id: "step4FirstHomeBuyerSelect",
    stepId: baseNode.id,
    elementId: "select",
    name: "Step4 select",
    order: 2,
  });

  const tooltip = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "tooltip",
    name: "Tooltip",
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
      propertyValue: "Are you a first home buyer?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue:
        "First home buyers may qualify for grants and benefits. Let us know if you're purchasing for the first time.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: firstHomeBuyerSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectName",
      propertyValue: "firstHomeBuyer",
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectOptions",
      propertyValue: '["Yes", "No"]',
    },
    {
      id: uuidV4(),
      stepElementId: firstHomeBuyerSelect.id,
      propertyId: "selectRequired",
      propertyValue: "true",
    },
    // Tooltip
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipTriggerText",
      propertyValue: "?",
    },
    {
      id: uuidV4(),
      stepElementId: tooltip.id,
      propertyId: "tooltipHoverText",
      propertyValue:
        "Find out more about grants, stamp duty concessions, and other benefits available to first home buyers.",
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

  console.log("🌱 Seeded Step4");

  return step4;
}
