import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { OrgUserPermission } from "@root/sharedTypes/enums";

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
        tableName: "organizationUsers",
        indexes: [{ fields: ["userId"] }, { fields: ["organizationId"] }],
      }
    );
    return OrganizationUser;
  }
}
