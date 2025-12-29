import { Models } from "@db/models";

export async function seedElements(models: Models) {
  await models.Element.bulkCreate([
    {
      id: "header",
      name: "Header",
      description: "Header of the form",
    },
    {
      id: "subtitle",
      name: "subtitle",
      description: "Subtitle of the form",
    },
    { id: "label", name: "Label", description: "Label for an input" },
    {
      id: "text_input",
      name: "Text Input",
      description: "Single-line text input field",
    },
    {
      id: "textarea",
      name: "Textarea",
      description: "Multi-line text input field",
    },
    {
      id: "number_input",
      name: "Number Input",
      description: "Numeric input field",
    },
    {
      id: "select",
      name: "Select",
      description: "Dropdown select input",
    },
    {
      id: "button",
      name: "Button",
      description: "Clickable button element",
    },
    {
      id: "tooltip",
      name: "Tooltip",
      description: "Tooltip shows information on hover",
    },
    {
      id: "date_picker",
      name: "Date Picker",
      description: "Single date picker",
    },
  ]);

  console.log("🌱 Seeded elements");
}
