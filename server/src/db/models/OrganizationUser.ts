import { OrganizationUserPermission } from "@sharedTypes/enums";
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
  declare permissions: OrganizationUserPermission;

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
          type: DataTypes.ENUM(...Object.values(OrganizationUserPermission)),
          allowNull: false,
          defaultValue: OrganizationUserPermission.VIEWER,
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
