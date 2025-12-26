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

  // connections: cannot FK to steps/decisionNodes cleanly without a shared nodes table
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
