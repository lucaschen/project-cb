import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { OrgUserPermission } from "./enums";

export class OrganizationUser extends Model<
  InferAttributes<OrganizationUser>,
  InferCreationAttributes<OrganizationUser>
> {
  declare organization_id: string;
  declare user_id: string;
  declare permissions: OrgUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUser.init(
      {
        organization_id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        user_id: {
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
