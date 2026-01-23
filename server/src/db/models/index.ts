import type { Sequelize } from "sequelize";

import { DecisionNode } from "./DecisionNode";
import { DecisionNodeConditions } from "./DecisionNodeConditions";
import { Element } from "./Element";
import { ElementProperties } from "./ElementProperties";
import { Flow } from "./Flow";
import { Node } from "./Node";
import { NodeCoordinates } from "./NodeCoordinates";
import { Organization } from "./Organization";
import { OrganizationUser } from "./OrganizationUser";
import { OrganizationUserInvitation } from "./OrganizationUserInvitation";
import { Step } from "./Step";
import { StepElement } from "./StepElement";
import { StepElementCondition } from "./StepElementCondition";
import { StepElementProperties } from "./StepElementProperties";
import { User } from "./User";
import { UserSession } from "./UserSession";

export type Models = ReturnType<typeof initModels>;

export function initModels(sequelize: Sequelize) {
  // init
  DecisionNode.initModel(sequelize);
  DecisionNodeConditions.initModel(sequelize);
  Element.initModel(sequelize);
  ElementProperties.initModel(sequelize);
  Flow.initModel(sequelize);
  Node.initModel(sequelize);
  NodeCoordinates.initModel(sequelize);
  Organization.initModel(sequelize);
  OrganizationUser.initModel(sequelize);
  OrganizationUserInvitation.initModel(sequelize);
  Step.initModel(sequelize);
  StepElement.initModel(sequelize);
  StepElementCondition.initModel(sequelize);
  StepElementProperties.initModel(sequelize);
  User.initModel(sequelize);
  UserSession.initModel(sequelize);

  Node.hasOne(NodeCoordinates, { foreignKey: "nodeId", as: "coordinates" });
  NodeCoordinates.belongsTo(Node, { foreignKey: "nodeId", as: "node" });

  Node.hasOne(Step, { foreignKey: "nodeId", as: "stepData" });
  Step.belongsTo(Node, { foreignKey: "nodeId", as: "node" });

  Node.hasOne(DecisionNode, { foreignKey: "nodeId", as: "decisionData" });
  DecisionNode.belongsTo(Node, { foreignKey: "nodeId", as: "node" });

  DecisionNode.hasMany(DecisionNodeConditions, {
    foreignKey: "nodeId",
    as: "decisionNodeConditions",
  });
  DecisionNodeConditions.belongsTo(DecisionNode, {
    foreignKey: "nodeId",
    as: "decisionNode",
  });

  // Flow -> Node (1:N)
  Flow.hasMany(Node, {
    foreignKey: "flowId",
    as: "nodes",
  });

  Node.belongsTo(Flow, {
    foreignKey: "flowId",
    as: "flow",
  });
  // Element -> ElementProperties (1:N)
  Element.hasMany(ElementProperties, {
    foreignKey: "elementId",
    as: "properties",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  ElementProperties.belongsTo(Element, {
    foreignKey: "elementId",
    as: "element",
  });

  // StepElement -> StepElementProperties (1:N)
  StepElement.hasMany(StepElementProperties, {
    foreignKey: "stepElementId",
    as: "propertyValues",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  StepElementProperties.belongsTo(StepElement, {
    foreignKey: "stepElementId",
    as: "stepElement",
  });

  // ElementProperties -> StepElementProperties (1:N)
  ElementProperties.hasMany(StepElementProperties, {
    foreignKey: "propertyId",
    as: "values",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  StepElementProperties.belongsTo(ElementProperties, {
    foreignKey: "propertyId",
    as: "property",
  });

  // associations that are representable with real FKs
  Organization.hasMany(Flow, { foreignKey: "organizationId", as: "flows" });
  Flow.belongsTo(Organization, {
    foreignKey: "organizationId",
    as: "organization",
  });

  Flow.hasMany(Step, { foreignKey: "flowId", as: "steps" });
  Step.belongsTo(Flow, { foreignKey: "flowId", as: "flow" });

  Flow.hasMany(DecisionNode, { foreignKey: "flowId", as: "decisionNodes" });
  DecisionNode.belongsTo(Flow, { foreignKey: "flowId", as: "flow" });

  // org <-> user many-to-many via join table with extra column (permissions)
  Organization.belongsToMany(User, {
    through: OrganizationUser,
    foreignKey: "organizationId",
    otherKey: "userId",
    as: "users",
  });
  User.belongsToMany(Organization, {
    through: OrganizationUser,
    foreignKey: "userId",
    otherKey: "organizationId",
    as: "organizations",
  });

  Organization.hasMany(OrganizationUser, {
    foreignKey: "organizationId",
    as: "organizationUsers",
  });
  OrganizationUser.belongsTo(Organization, {
    foreignKey: "organizationId",
    as: "organization",
  });

  User.hasMany(OrganizationUser, {
    foreignKey: "userId",
    as: "organizationUsers",
  });
  OrganizationUser.belongsTo(User, { foreignKey: "userId", as: "user" });

  // invitations
  Organization.hasMany(OrganizationUserInvitation, {
    foreignKey: "organizationId",
    as: "invitations",
  });
  OrganizationUserInvitation.belongsTo(Organization, {
    foreignKey: "organizationId",
    as: "organization",
  });
  User.hasMany(OrganizationUserInvitation, {
    foreignKey: "userId",
    as: "invitations",
  });
  OrganizationUserInvitation.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // sessions
  User.hasMany(UserSession, { foreignKey: "userId", as: "sessions" });
  UserSession.belongsTo(User, { foreignKey: "userId", as: "user" });

  // step elements & conditions (only FK we can express from your schema)
  StepElement.hasMany(StepElementCondition, {
    foreignKey: "stepElementId",
    as: "conditions",
  });
  StepElementCondition.belongsTo(StepElement, {
    foreignKey: "stepElementId",
    as: "stepElement",
  });

  return {
    Node,
    NodeCoordinates,
    DecisionNode,
    DecisionNodeConditions,
    Element,
    ElementProperties,
    Flow,
    Organization,
    OrganizationUser,
    OrganizationUserInvitation,
    Step,
    StepElement,
    StepElementCondition,
    StepElementProperties,
    User,
    UserSession,
  };
}
