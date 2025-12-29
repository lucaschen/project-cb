import { Models } from "@db/models";
import { ElementPropertyTypes } from "@sharedTypes/enums";

export async function seedElementProperties(models: Models) {
  await models.ElementProperties.bulkCreate([
    // ───────────────────
    // HEADER
    // ───────────────────
    {
      id: "header_text",
      elementId: "header",
      propertyName: "text",
      description: "Main header text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Header",
    },
    {
      id: "header_align",
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
      id: "subtitle_text",
      elementId: "subtitle",
      propertyName: "text",
      description: "Subtitle text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Subtitle",
    },
    {
      id: "subtitle_align",
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
      id: "label_text",
      elementId: "label",
      propertyName: "text",
      description: "Label text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "label_for",
      elementId: "label",
      propertyName: "htmlFor",
      description: "The name of the input for the label",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: false,
      defaultValue: "",
    },
    // ───────────────────
    // TEXT INPUT
    // ───────────────────
    {
      id: "text_input_placeholder",
      elementId: "text_input",
      propertyName: "placeholder",
      description: "Placeholder text inside the input",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "",
    },
    {
      id: "text_input_name",
      elementId: "text_input",
      propertyName: "name",
      description: "Name of input in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "text_input_required",
      elementId: "text_input",
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
      id: "textarea_label",
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
      id: "number_input_label",
      elementId: "number_input",
      propertyName: "label",
      description: "Label displayed above the input",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "number_input_name",
      elementId: "number_input",
      propertyName: "name",
      description: "Name of input in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "number_input_required",
      elementId: "number_input",
      propertyName: "required",
      description: "Whether the field is required",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "number_input_min",
      elementId: "number_input",
      propertyName: "min",
      description: "Minimum allowed value",
      propertyType: ElementPropertyTypes.NUMBER,
      required: false,
      defaultValue: "",
    },
    {
      id: "number_input_max",
      elementId: "number_input",
      propertyName: "max",
      description: "Maximum allowed value",
      propertyType: ElementPropertyTypes.NUMBER,
      required: false,
      defaultValue: "",
    },
    {
      id: "number_input_format",
      elementId: "number_input",
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
      id: "select_name",
      elementId: "select",
      propertyName: "name",
      description: "Name of select in the form",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "select_options",
      elementId: "select",
      propertyName: "options",
      description: "Selectable options (JSON array)",
      propertyType: ElementPropertyTypes.ARRAY,
      required: true,
      defaultValue: "[]",
    },
    {
      id: "select_required",
      elementId: "select",
      propertyName: "required",
      description: "is selection required",
      propertyType: ElementPropertyTypes.ARRAY,
      required: true,
      defaultValue: "true",
    },
    {
      id: "select_multiple",
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
      id: "button_text",
      elementId: "button",
      propertyName: "text",
      description: "Button label text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "Button",
    },
    {
      id: "button_variant",
      elementId: "button",
      propertyName: "variant",
      description: "Button style variant",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "primary",
    },
    {
      id: "button_disable_when_incomplete",
      elementId: "button",
      propertyName: "disabledWhenIncomplete",
      description: "Disable button when form is incomplete",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "false",
    },
    {
      id: "button_on_click",
      elementId: "button",
      propertyName: "onClick",
      description: "Funcion to execute on button click",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "continue()",
    },
    // ───────────────────
    // TOOLTIP
    // ───────────────────
    {
      id: "tooltip_trigger_text",
      elementId: "tooltip",
      propertyName: "triggerText",
      description: "Tooltip trigger text",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "tooltip",
    },
    {
      id: "tooltip_hover_text",
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
      id: "date_picker_name",
      elementId: "date_picker",
      propertyName: "name",
      description: "Name of date input",
      propertyType: ElementPropertyTypes.STRING,
      required: true,
      defaultValue: "",
    },
    {
      id: "date_picker_format",
      elementId: "date_picker",
      propertyName: "format",
      description: "Date format, e.g. YYYY-MM-DD",
      propertyType: ElementPropertyTypes.STRING,
      required: false,
      defaultValue: "YYYY-MM-DD",
    },
    {
      id: "date_picker_required",
      elementId: "date_picker",
      propertyName: "required",
      description: "Whether the date is required",
      propertyType: ElementPropertyTypes.BOOLEAN,
      required: true,
      defaultValue: "true",
    },
  ]);

  console.log("🌱 Seeded element properties");
}
