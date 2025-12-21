import type { Sequelize } from "sequelize";

import { Organization } from "./Organization";
import { User } from "./User";
import { OrganizationUser } from "./OrganizationUser";
import { OrganizationUserInvitation } from "./OrganizationUserInvitation";
import { UserSession } from "./UserSession";
import { Flow } from "./Flow";
import { Step } from "./Step";
import { DecisionNode } from "./DecisionNode";
import { Connection } from "./Connection";
import { StepElement } from "./StepElement";
import { StepElementCondition } from "./StepElementCondition";

export type Models = ReturnType<typeof initModels>;

export function initModels(sequelize: Sequelize) {
  // init
  Organization.initModel(sequelize);
  User.initModel(sequelize);
  OrganizationUser.initModel(sequelize);
  OrganizationUserInvitation.initModel(sequelize);
  UserSession.initModel(sequelize);
  Flow.initModel(sequelize);
  Step.initModel(sequelize);
  DecisionNode.initModel(sequelize);
  Connection.initModel(sequelize);
  StepElement.initModel(sequelize);
  StepElementCondition.initModel(sequelize);

  // associations that are representable with real FKs
  Organization.hasMany(Flow, { foreignKey: "organization_id", as: "flows" });
  Flow.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  Flow.hasMany(Step, { foreignKey: "flow_id", as: "steps" });
  Step.belongsTo(Flow, { foreignKey: "flow_id", as: "flow" });

  Flow.hasMany(DecisionNode, { foreignKey: "flow_id", as: "decisionNodes" });
  DecisionNode.belongsTo(Flow, { foreignKey: "flow_id", as: "flow" });

  // org <-> user many-to-many via join table with extra column (permissions)
  Organization.belongsToMany(User, {
    through: OrganizationUser,
    foreignKey: "organization_id",
    otherKey: "user_id",
    as: "users",
  });
  User.belongsToMany(Organization, {
    through: OrganizationUser,
    foreignKey: "user_id",
    otherKey: "organization_id",
    as: "organizations",
  });

  Organization.hasMany(OrganizationUser, {
    foreignKey: "organization_id",
    as: "organizationUsers",
  });
  OrganizationUser.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  User.hasMany(OrganizationUser, {
    foreignKey: "user_id",
    as: "organizationUsers",
  });
  OrganizationUser.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // invitations
  Organization.hasMany(OrganizationUserInvitation, {
    foreignKey: "organization_id",
    as: "invitations",
  });
  OrganizationUserInvitation.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });
  User.hasMany(OrganizationUserInvitation, {
    foreignKey: "user_id",
    as: "invitations",
  });
  OrganizationUserInvitation.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // sessions
  User.hasMany(UserSession, { foreignKey: "user_id", as: "sessions" });
  UserSession.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // step elements & conditions (only FK we can express from your schema)
  StepElement.hasMany(StepElementCondition, {
    foreignKey: "step_element_id",
    as: "conditions",
  });
  StepElementCondition.belongsTo(StepElement, {
    foreignKey: "step_element_id",
    as: "stepElement",
  });

  // connections: cannot FK to steps/decision_nodes cleanly without a shared nodes table
  // so no belongsTo association here on purpose.

  return {
    Organization,
    User,
    OrganizationUser,
    OrganizationUserInvitation,
    UserSession,
    Flow,
    Step,
    DecisionNode,
    Connection,
    StepElement,
    StepElementCondition,
  };
}
