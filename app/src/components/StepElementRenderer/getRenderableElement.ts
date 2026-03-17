import {
  buttonElementPropertiesSchema,
  datePickerElementPropertiesSchema,
  type ElementType,
  headerElementPropertiesSchema,
  labelElementPropertiesSchema,
  numberInputElementPropertiesSchema,
  selectElementPropertiesSchema,
  subtitleElementPropertiesSchema,
  textareaElementPropertiesSchema,
  textInputElementPropertiesSchema,
  tooltipElementPropertiesSchema,
} from "@packages/shared/generated/elements/index";
import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";

type RenderableStepElementInput = Pick<
  HydratedStepElementType,
  "elementId" | "properties"
>;

const getPropertyValue = (
  element: RenderableStepElementInput,
  propertyName: string,
) =>
  element.properties.find((property) => property.propertyName === propertyName)
    ?.value ?? "";

const getOptionalPropertyValue = (
  element: RenderableStepElementInput,
  propertyName: string,
) => {
  const value = getPropertyValue(element, propertyName);

  return value.length === 0 ? undefined : value;
};

const getBooleanPropertyValue = (
  element: RenderableStepElementInput,
  propertyName: string,
) => {
  const value = getOptionalPropertyValue(element, propertyName);

  if (value === undefined) {
    return undefined;
  }

  return value === "true";
};

const getNumberPropertyValue = (
  element: RenderableStepElementInput,
  propertyName: string,
) => {
  const value = getOptionalPropertyValue(element, propertyName);

  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const getArrayPropertyValue = (
  element: RenderableStepElementInput,
  propertyName: string,
) => {
  const value = getOptionalPropertyValue(element, propertyName);

  if (value === undefined) {
    return undefined;
  }

  try {
    const parsedValue = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue : undefined;
  } catch {
    return undefined;
  }
};

const getRenderableElement = (
  element: RenderableStepElementInput,
): ElementType | null => {
  switch (element.elementId) {
    case "header": {
      const parsedProperties = headerElementPropertiesSchema.safeParse({
        align: getOptionalPropertyValue(element, "align"),
        text: getOptionalPropertyValue(element, "text"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "header",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "subtitle": {
      const parsedProperties = subtitleElementPropertiesSchema.safeParse({
        align: getOptionalPropertyValue(element, "align"),
        text: getOptionalPropertyValue(element, "text"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "subtitle",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "label": {
      const parsedProperties = labelElementPropertiesSchema.safeParse({
        htmlFor: getOptionalPropertyValue(element, "htmlFor"),
        text: getPropertyValue(element, "text"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "label",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "textInput": {
      const parsedProperties = textInputElementPropertiesSchema.safeParse({
        name: getPropertyValue(element, "name"),
        placeholder: getOptionalPropertyValue(element, "placeholder"),
        required: getBooleanPropertyValue(element, "required"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "textInput",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "textarea": {
      const parsedProperties = textareaElementPropertiesSchema.safeParse({
        label: getPropertyValue(element, "label"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "textarea",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "numberInput": {
      const parsedProperties = numberInputElementPropertiesSchema.safeParse({
        format: getOptionalPropertyValue(element, "format"),
        label: getPropertyValue(element, "label"),
        max: getNumberPropertyValue(element, "max"),
        min: getNumberPropertyValue(element, "min"),
        name: getPropertyValue(element, "name"),
        required: getBooleanPropertyValue(element, "required"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "numberInput",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "select": {
      const parsedProperties = selectElementPropertiesSchema.safeParse({
        multiple: getBooleanPropertyValue(element, "multiple"),
        name: getPropertyValue(element, "name"),
        options: getArrayPropertyValue(element, "options"),
        required: getBooleanPropertyValue(element, "required"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "select",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "button": {
      const parsedProperties = buttonElementPropertiesSchema.safeParse({
        disabledWhenIncomplete: getBooleanPropertyValue(
          element,
          "disabledWhenIncomplete",
        ),
        onClick: getOptionalPropertyValue(element, "onClick"),
        text: getOptionalPropertyValue(element, "text"),
        variant: getOptionalPropertyValue(element, "variant"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "button",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "tooltip": {
      const parsedProperties = tooltipElementPropertiesSchema.safeParse({
        hoverText: getOptionalPropertyValue(element, "hoverText"),
        triggerText: getOptionalPropertyValue(element, "triggerText"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "tooltip",
        name: "",
        properties: parsedProperties.data,
      };
    }
    case "datePicker": {
      const parsedProperties = datePickerElementPropertiesSchema.safeParse({
        format: getOptionalPropertyValue(element, "format"),
        name: getPropertyValue(element, "name"),
        required: getBooleanPropertyValue(element, "required"),
      });

      if (!parsedProperties.success) {
        return null;
      }

      return {
        description: "",
        elementId: "datePicker",
        name: "",
        properties: parsedProperties.data,
      };
    }
    default:
      return null;
  }
};

export default getRenderableElement;
