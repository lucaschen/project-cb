import { OrgUserPermission } from "@sharedTypes/enums";
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
  declare userId: string;
  declare expiresAt: Date;
  declare permissions: OrgUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUserInvitation.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        organizationId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
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
