import { OrgUserPermission } from "@sharedTypes/enums";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class OrganizationUser extends Model<
  InferAttributes<OrganizationUser>,
  InferCreationAttributes<OrganizationUser>
> {
  declare organizationId: string;
  declare userId: string;
  declare permissions: OrgUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUser.init(
      {
        organizationId: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        permissions: {
          type: DataTypes.ENUM(...Object.values(OrgUserPermission)),
          allowNull: false,
          defaultValue: OrgUserPermission.VIEWER,
        },
      },
      {
        sequelize,
        tableName: "organization_users",
        indexes: [{ fields: ["user_id"] }, { fields: ["organization_id"] }],
      }
    );
    return OrganizationUser;
  }
}
