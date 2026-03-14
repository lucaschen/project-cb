import { OrganizationUserPermission } from "@packages/shared/types/enums";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class OrganizationUserInvitation extends Model<
  InferAttributes<OrganizationUserInvitation>,
  InferCreationAttributes<OrganizationUserInvitation>
> {
  declare id: string;
  declare organizationId: string;
  declare email: string;
  declare invitedByUserId: string;
  declare expiresAt: Date;
  declare permissions: OrganizationUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUserInvitation.init(
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        organizationId: { type: DataTypes.UUID, allowNull: false },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isEmail: true },
        },
        invitedByUserId: { type: DataTypes.UUID, allowNull: false },
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
          { fields: ["invitedByUserId"] },
          { fields: ["email"] },
          { fields: ["expiresAt"] },
        ],
      },
    );
    return OrganizationUserInvitation;
  }
}
