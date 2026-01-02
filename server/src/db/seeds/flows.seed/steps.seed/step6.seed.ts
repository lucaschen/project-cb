import { Models } from "@db/models";
import { ComparisonOperation } from "@sharedTypes/enums";
import { v4 as uuidV4 } from "uuid";

export default async function seedStep6(models: Models) {
  const step6 = await models.Step.create({
    id: uuidV4(),
    flowId: "seedFlow1",
    name: "Step6",
    x: 100,
    y: 100,
  });

  // ───────────────────
  // Elements
  // ───────────────────
  const header = await models.StepElement.create({
    id: uuidV4(),
    stepId: step6.id,
    elementId: "header",
    name: "Step6 title",
    order: 0,
  });

  const label = await models.StepElement.create({
    id: uuidV4(),
    stepId: step6.id,
    elementId: "label",
    name: "Step6 label",
    order: 1,
  });

  const propertyUsageSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: step6.id,
    elementId: "select",
    name: "Property usage select",
    order: 2,
  });

  // conditional experiment elements (may be shown randomly when Step4.isFirstHome === false)
  const hasExistingInvestmentLabel = await models.StepElement.create({
    id: uuidV4(),
    stepId: step6.id,
    elementId: "label",
    name: "Existing investment label",
    order: 3,
  });

  const hasExistingInvestmentSelect = await models.StepElement.create({
    id: uuidV4(),
    stepId: step6.id,
    elementId: "select",
    name: "Existing investment select",
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
      propertyId: "header_text",
      propertyValue: "How will this property be used?",
    },
    // Label
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_text",
      propertyValue:
        "Is this property your home or an investment? Your answer helps us tailor your home loan options.",
    },
    {
      id: uuidV4(),
      stepElementId: label.id,
      propertyId: "label_for",
      propertyValue: propertyUsageSelect.id,
    },
    // Select input
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "select_name",
      propertyValue: "property_usage",
    },
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "select_options",
      propertyValue: "['I will live there', 'Its an investment']",
    },
    {
      id: uuidV4(),
      stepElementId: propertyUsageSelect.id,
      propertyId: "select_required",
      propertyValue: "true",
    },
    // Experiment: additional question when selected by experiment
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      propertyId: "label_text",
      propertyValue: "Do you have an existing investment property",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "select_name",
      propertyValue: "has_existing_investment",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "select_options",
      propertyValue: "['Yes', 'No']",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      propertyId: "select_required",
      propertyValue: "true",
    },
  ]);

  // ───────────────────
  // Experiment conditions: show when Step4.first_home_buyer === 'No' AND randomNumber(0,100) <= 50
  // ───────────────────
  await models.StepElementCondition.bulkCreate([
    // label conditions
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      value: `stepElementValueById(step4_first_home_buyer_select)`,
      operation: ComparisonOperation.EQ,
      comparisonValue: "No",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentLabel.id,
      value: `randomNumber(0, 100)`,
      operation: ComparisonOperation.LTE,
      comparisonValue: "50",
    },
    // select conditions
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      value: `stepElementValueById(step4_first_home_buyer_select)`,
      operation: ComparisonOperation.EQ,
      comparisonValue: "No",
    },
    {
      id: uuidV4(),
      stepElementId: hasExistingInvestmentSelect.id,
      value: `randomNumber(0, 100)`,
      operation: ComparisonOperation.LTE,
      comparisonValue: "50",
    },
  ]);

  console.log("🌱 Seeded Step6");

  return step6;
}
