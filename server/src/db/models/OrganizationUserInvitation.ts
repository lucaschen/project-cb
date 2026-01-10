import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { OrganizationUserPermission } from "~sharedTypes/enums";

export class OrganizationUserInvitation extends Model<
  InferAttributes<OrganizationUserInvitation>,
  InferCreationAttributes<OrganizationUserInvitation>
> {
  declare id: string;
  declare organizationId: string;
  declare userId: string;
  declare expiresAt: Date;
  declare permissions: OrganizationUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUserInvitation.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        organizationId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        permissions: {
          type: DataTypes.ENUM(...Object.values(OrganizationUserPermission)),
          allowNull: false,
          defaultValue: OrganizationUserPermission.VIEWER,
        },
      },
      {
        sequelize,
        tableName: "organizationUserInvitations",
        indexes: [
          { fields: ["organizationId"] },
          { fields: ["userId"] },
          { fields: ["expiresAt"] },
        ],
      }
    );
    return OrganizationUserInvitation;
  }
}
