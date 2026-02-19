export enum ComparisonOperation {
  EQ = "===",
  GTE = ">=",
  LTE = "<=",
}

export enum ElementPropertyTypes {
  ARRAY = "ARRAY",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  OBJECT = "OBJECT",
  STRING = "STRING",
}

export enum NodeType {
  DECISION = "DECISION",
  STEP = "STEP",
}

export enum OrganizationUserPermission {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export enum StepElementType {
  BUTTON = "BUTTON",
  HEADER = "HEADER",
  LABEL = "LABEL",
  NUMBER_INPUT = "NUMBER_INPUT",
  RADIO_INPUT = "RADIO_INPUT",
  STRING_INPUT = "STRING_INPUT",
  SUB_HEADER = "SUB_HEADER",
  // TEXTAREA_INPUT = "TEXTAREA_INPUT",
  // SELECT_INPUT = "SELECT_INPUT",
  // TOOLTIP = "TOOLTIP",
}
