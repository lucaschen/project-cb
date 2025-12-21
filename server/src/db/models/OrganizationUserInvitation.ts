import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { OrgUserPermission } from "./enums";

export class OrganizationUserInvitation extends Model<
  InferAttributes<OrganizationUserInvitation>,
  InferCreationAttributes<OrganizationUserInvitation>
> {
  declare id: string;
  declare organization_id: string;
  declare user_id: string;
  declare expires_at: Date;
  declare permissions: OrgUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUserInvitation.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        organization_id: { type: DataTypes.STRING, allowNull: false },
        user_id: { type: DataTypes.STRING, allowNull: false },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        permissions: {
          type: DataTypes.ENUM(...Object.values(OrgUserPermission)),
          allowNull: false,
          defaultValue: OrgUserPermission.VIEWER,
        },
      },
      {
        sequelize,
        tableName: "organization_user_invitations",
        indexes: [
          { fields: ["organization_id"] },
          { fields: ["user_id"] },
          { fields: ["expires_at"] },
        ],
      }
    );
    return OrganizationUserInvitation;
  }
}
