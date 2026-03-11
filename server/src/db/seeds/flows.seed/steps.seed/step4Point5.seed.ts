import { ComparisonOperation, NodeType } from "@packages/shared/types/enums";
import { v4 as uuidV4 } from "uuid";

import { Models } from "~db/models";

export default async function seedStep4Point5(models: Models) {
  const flow = await models.Flow.findOne({
    where: { slug: "main-flow" },
  });

  if (!flow) {
    throw new Error("Flow not found for seeding step");
  }

  const baseNode = await models.Node.create({
    id: uuidV4(),
    flowId: flow.id,
    name: "Step4Point5",
    type: NodeType.STEP,
  });

  await models.NodeCoordinate.create({
    nodeId: baseNode.id,
    x: 100,
    y: 100,
  });

  const step4Point5 = await models.Step.create({
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
    name: "Step4Point5 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Step4Point5 label",
    order: 1,
  });

  const numberInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "numberInput",
    name: "Estimated value input",
    order: 1,
  });

  const ownedLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "Owned label",
    order: 2,
  });

  const ownedSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "select",
    name: "Owned select",
    order: 3,
  });

  // conditional elements (shown when Owned select === 'No')
  const purchasedLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "label",
    name: "When purchased label",
    order: 4,
  });

  const datePicker = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "datePicker",
    name: "Month picker",
    order: 5,
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
      propertyValue: "Lets get an idea of your financial situation",
    },
    // Estimated value label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelText",
      propertyValue: "What is the estimated value of your properties?",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "labelFor",
      propertyValue: numberInput.id,
    },
    // Number input
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "numberInputFormat",
      propertyValue: "$0,0",
    },
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "numberInputName",
      propertyValue: "estimatedPropertiesValue",
    },
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "numberInputRequired",
      propertyValue: "true",
    },
    // Owned label + select
    {
      id: uuidV4(),
      stepElementId: ownedLabel.id,
      propertyId: "labelText",
      propertyValue: "Have you owned your last purchased property for 1 year?",
    },
    {
      id: uuidV4(),
      stepElementId: ownedLabel.id,
      propertyId: "labelFor",
      propertyValue: ownedSelect.id,
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "selectName",
      propertyValue: "ownedLastPropertyOneYear",
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "selectOptions",
      propertyValue: '["Yes", "No"]',
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "selectRequired",
      propertyValue: "true",
    },
    // Conditional label + month picker (shown when Owned select === 'No')
    {
      id: uuidV4(),
      stepElementId: purchasedLabel.id,
      propertyId: "labelText",
      propertyValue: "When was the property purchased?",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "datePickerName",
      propertyValue: "lastPropertyPurchaseMonth",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "datePickerFormat",
      propertyValue: "YYYY-MM",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "datePickerRequired",
      propertyValue: "true",
    },
  ]);

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: baseNode.id,
    elementId: "button",
    name: "Next button",
    order: 6,
  });

  // ───────────────────
  // Conditions: show purchase date fields when Owned select === 'No'
  // ───────────────────
  await models.StepElementCondition.bulkCreate([
    {
      id: uuidV4(),
      stepElementId: purchasedLabel.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "stepElementValue",
          stepElementId: ownedSelect.id,
        },
        operator: ComparisonOperation.EQ,
        rightValue: "No",
      },
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      statement: {
        type: "comparison",
        leftValue: {
          type: "stepElementValue",
          stepElementId: ownedSelect.id,
        },
        operator: ComparisonOperation.EQ,
        rightValue: "No",
      },
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

  console.log("🌱 Seeded Step4.5");

  return step4Point5;
}
