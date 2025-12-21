import { FORM_ELEMENTS } from "@app/constants/form";

export type FormElement<T = keyof typeof FORM_ELEMENTS> = {
  key: T;
  id: string;
  properties: Record<string, unknown>;
  realProperties: {};
};

const exampleStep1 = {
  name: "Step1",
  id: "uuid",
  coordinates: { x: 100, y: 100 }, // position in flow
  formElements: [
    {
      key: "textInput",
      id: "uuid",
      properties: [
        {
          propertyName: "name",
          type: "string",
          defaultValue: "",
          value: "firstName",
        }, // value variable name, how it is accessed e.g. exampleStep.data.firstName
        {
          propertyName: "label",
          type: "string",
          defaultValue: "",
          value: "Text Input",
        }, // label text
        {
          propertyName: "expose",
          type: "boolean",
          defaultValue: false,
          value: false,
        }, // allow value to be used for conditions in step connectors
        {
          propertyName: "value",
          type: "string",
          defaultValue: "",
          value: "Bob",
        },
      ],
    },
    {
      key: "numberInput",
      id: "uuid",
      properties: [
        {
          propertyName: "name",
          type: "string",
          defaultValue: "",
          value: "age",
        },
        {
          propertyName: "label",
          type: "string",
          defaultValue: "",
          value: "Number Input",
        },
        {
          propertyName: "expose",
          type: "boolean",
          defaultValue: false,
          value: true,
        },
        {
          propertyName: "value",
          type: "number",
          defaultValue: null,
          value: 18,
        },
      ],
    },
  ],
};

export type StepDataSchema = {
  name: string;
  id: string;
  coordinates: { x: number; y: number };
  formElements: FormElement[];
};
