import { Checkbox, Field, Input, Text } from "@chakra-ui/react";

export const FORM_ELEMENTS = {
  textInput: {
    label: "Text",
    element: (
      <Field.Root>
        <Field.Label>Text input</Field.Label>
        <Input
          readOnly
          cursor="pointer"
          name="text-placeholder"
          type="text"
          value=""
        />
      </Field.Root>
    ),
    properties: {
      name: "string",
      expose: "boolean",
    },
  },
  numberInput: {
    label: "Number",
    element: (
      <Field.Root>
        <Field.Label>Number input</Field.Label>
        <Input
          readOnly
          cursor="pointer"
          name="number-placeholder"
          type="number"
          value=""
        />
      </Field.Root>
    ),
    properties: {
      name: "string",
      expose: "boolean",
    },
  },
  checkbox: {
    label: "Checkbox",
    element: (
      <Checkbox.Root readOnly cursor="pointer">
        <Checkbox.HiddenInput />
        <Checkbox.Control cursor="pointer" />
        <Checkbox.Label>Checkbox</Checkbox.Label>
      </Checkbox.Root>
    ),
    properties: {
      name: "string",
      expose: "boolean",
    },
  },
  label: {
    label: "Label",
    element: <Text cursor="pointer">Placeholder Label Text</Text>,
    properties: {
      text: "string",
    },
  },
};

export type FormElement = {
  key: keyof typeof FORM_ELEMENTS;
  id: string;
  properties: Record<string, unknown>;
};
