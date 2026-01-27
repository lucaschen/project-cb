import { Models } from "~db/models";
import { ElementPropertyTypes } from "../../../../packages/shared/src/types/enums";

export async function seedElementProperties(models: Models) {
  await models.ElementProperties.bulkCreate([
    // ───────────────────
    // HEADER
    // ───────────────────
    {
      id: "headerText",
      elementId: "header",
      propertyName: "text",
      description: "Main header text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Header",
    },
    {
      id: "headerAlign",
      elementId: "header",
      propertyName: "align",
      description: "Text alignment",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "center",
    },

    // ───────────────────
    // SUBTITLE
    // ───────────────────
    {
      id: "subtitleText",
      elementId: "subtitle",
      propertyName: "text",
      description: "Subtitle text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Subtitle",
    },
    {
      id: "subtitleAlign",
      elementId: "subtitle",
      propertyName: "align",
      description: "Text alignment",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "center",
    },

    // ───────────────────
    // LABEL
    // ───────────────────
    {
      id: "labelText",
      elementId: "label",
      propertyName: "text",
      description: "Label text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "labelFor",
      elementId: "label",
      propertyName: "htmlFor",
      description: "The name of the input for the label",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "",
    },
    // ───────────────────
    // TEXT INPUT
    // ───────────────────
    {
      id: "textInputPlaceholder",
      elementId: "textInput",
      propertyName: "placeholder",
      description: "Placeholder text inside the input",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "",
    },
    {
      id: "textInputName",
      elementId: "textInput",
      propertyName: "name",
      description: "Name of input in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "textInputRequired",
      elementId: "textInput",
      propertyName: "required",
      description: "Whether the field is required",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "true",
    },

    // ───────────────────
    // TEXTAREA
    // ───────────────────
    {
      id: "textareaLabel",
      elementId: "textarea",
      propertyName: "label",
      description: "Label displayed above the textarea",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },

    // ───────────────────
    // NUMBER INPUT
    // ───────────────────
    {
      id: "numberInputLabel",
      elementId: "numberInput",
      propertyName: "label",
      description: "Label displayed above the input",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "numberInputName",
      elementId: "numberInput",
      propertyName: "name",
      description: "Name of input in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "numberInputRequired",
      elementId: "numberInput",
      propertyName: "required",
      description: "Whether the field is required",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "true",
    },
    {
      id: "numberInputMin",
      elementId: "numberInput",
      propertyName: "min",
      description: "Minimum allowed value",
      propertyType: ElementPropertyTypes.NUMBER,
      required: false,
      defaultValue: "",
    },
    {
      id: "numberInputMax",
      elementId: "numberInput",
      propertyName: "max",
      description: "Maximum allowed value",
      propertyType: ElementPropertyTypes.NUMBER,
      required: false,
      defaultValue: "",
    },
    {
      id: "numberInputFormat",
      elementId: "numberInput",
      propertyName: "format",
      description: "numeral format to use e.g. $0[.]00",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "",
    },

    // ───────────────────
    // SELECT
    // ───────────────────
    {
      id: "selectName",
      elementId: "select",
      propertyName: "name",
      description: "Name of select in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "selectOptions",
      elementId: "select",
      propertyName: "options",
      description: "Selectable options (JSON array)",
      propertyType: ElementPropertyTypes.ARRAY,
      required: true,
      defaultValue: "[]",
    },
    {
      id: "selectRequired",
      elementId: "select",
      propertyName: "required",
      description: "is selection required",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "true",
    },
    {
      id: "selectMultiple",
      elementId: "select",
      propertyName: "multiple",
      description: "Allow multiple selection",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: false,
      defaultValue: "false",
    },

    // ───────────────────
    // BUTTON
    // ───────────────────
    {
      id: "buttonText",
      elementId: "button",
      propertyName: "text",
      description: "Button label text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Button",
    },
    {
      id: "buttonVariant",
      elementId: "button",
      propertyName: "variant",
      description: "Button style variant",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "primary",
    },
    {
      id: "buttonDisableWhenIncomplete",
      elementId: "button",
      propertyName: "disabledWhenIncomplete",
      description: "Disable button when form is incomplete",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "false",
    },
    {
      id: "buttonOnClick",
      elementId: "button",
      propertyName: "onClick",
      description: "Function to execute on button click",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "continue()",
    },
    // ───────────────────
    // TOOLTIP
    // ───────────────────
    {
      id: "tooltipTriggerText",
      elementId: "tooltip",
      propertyName: "triggerText",
      description: "Tooltip trigger text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "tooltip",
    },
    {
      id: "tooltipHoverText",
      elementId: "tooltip",
      propertyName: "hoverText",
      description: "Tooltip hover text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "tooltip description",
    },
    // ───────────────────
    // DATE PICKER
    // ───────────────────
    {
      id: "datePickerName",
      elementId: "datePicker",
      propertyName: "name",
      description: "Name of date input",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "datePickerFormat",
      elementId: "datePicker",
      propertyName: "format",
      description: "Date format, e.g. YYYY-MM-DD",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "YYYY-MM-DD",
    },
    {
      id: "datePickerRequired",
      elementId: "datePicker",
      propertyName: "required",
      description: "Whether the date is required",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "true",
    },
  ]);

  console.log("🌱 Seeded element properties");
}
