import { Models } from "@db/models";
import { ComparisonOperation } from "@sharedTypes/enums";
import { v4 as uuidV4 } from "uuid";

export async function seedStep1(models: Models) {
  const step4Point5 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step4Point5",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "header",
    name: "Step4Point5 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "label",
    name: "Step4Point5 label",
    order: 1,
  });

  const numberInput = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "number_input",
    name: "Estimated value input",
    order: 1,
  });

  const ownedLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "label",
    name: "Owned label",
    order: 2,
  });

  const ownedSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "select",
    name: "Owned select",
    order: 3,
  });

  // conditional elements (shown when Owned select === 'No')
  const purchasedLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "label",
    name: "When purchased label",
    order: 4,
  });

  const datePicker = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
    elementId: "date_picker",
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
      propertyId: "header_text",
      propertyValue: "Lets get an idea of your financial situation",
    },
    // Estimated value label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue: "What is the estimated value of your properties",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: numberInput.id,
    },
    // Number input
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "number_input_format",
      propertyValue: "$0,0",
    },
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "number_input_name",
      propertyValue: "estimated_properties_value",
    },
    {
      id: uuidV4(),
      stepElementId: numberInput.id,
      propertyId: "number_input_required",
      propertyValue: "true",
    },
    // Owned label + select
    {
      id: uuidV4(),
      stepElementId: ownedLabel.id,
      propertyId: "label_text",
      propertyValue: "Have you owned your last purchased property for 1 year",
    },
    {
      id: uuidV4(),
      stepElementId: ownedLabel.id,
      propertyId: "label_for",
      propertyValue: ownedSelect.id,
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "select_name",
      propertyValue: "owned_last_property_one_year",
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "select_options",
      propertyValue: "['Yes', 'No']",
    },
    {
      id: uuidV4(),
      stepElementId: ownedSelect.id,
      propertyId: "select_required",
      propertyValue: "true",
    },
    // Conditional label + month picker (shown when Owned select === 'No')
    {
      id: uuidV4(),
      stepElementId: purchasedLabel.id,
      propertyId: "label_text",
      propertyValue: "When was the property purchased",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "date_picker_name",
      propertyValue: "last_property_purchase_month",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "date_picker_format",
      propertyValue: "YYYY-MM",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      propertyId: "date_picker_required",
      propertyValue: "true",
    },
  ]);

  const nextButton = await models.StepElement.create({
    id: uuidV4(),
    stepId: step4Point5.id,
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
      value: `stepElementValueById(${ownedSelect.id})`,
      operation: ComparisonOperation.EQ,
      comparisonValue: "No",
    },
    {
      id: uuidV4(),
      stepElementId: datePicker.id,
      value: `stepElementValueById(${ownedSelect.id})`,
      operation: ComparisonOperation.EQ,
      comparisonValue: "No",
    },
  ]);

  // Next button properties
  await models.StepElementProperties.bulkCreate([
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

  console.log("🌱 Seeded Step4.5");

  return step4Point5;
}
