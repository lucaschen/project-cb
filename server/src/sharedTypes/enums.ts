export enum OrganizationUserPermission {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export enum ComparisonOperation {
  EQ = "===",
  GTE = ">=",
  LTE = "<=",
}

export enum StepElementType {
  HEADER = "HEADER",
  SUB_HEADER = "SUB_HEADER",
  LABEL = "LABEL",
  STRING_INPUT = "STRING_INPUT",
  NUMBER_INPUT = "NUMBER_INPUT",
  RADIO_INPUT = "RADIO_INPUT",
  BUTTON = "BUTTON",
  // TEXTAREA_INPUT = "TEXTAREA_INPUT",
  // SELECT_INPUT = "SELECT_INPUT",
  // TOOLTIP = "TOOLTIP",
}

export enum ElementPropertyTypes {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  OBJECT = "OBJECT",
  ARRAY = "ARRAY",
}

export enum NodeType {
  DECISION = "DECISION",
  STEP = "STEP",
}
